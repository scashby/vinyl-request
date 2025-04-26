// src/admin/BackfillMissingData.js

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const DISCOGS_TOKEN = 'YQeWNjcwlYvZFeYWxIkeOXDgnqqvQLYILhwrhpvo';

const BackfillMissingData = () => {
  const [missingRecords, setMissingRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const findMissingData = async () => {
    setLoading(true);
    setMessage('Searching for missing data...');

    const { data, error } = await supabase
      .from('collection')
      .select('*')
      .or('image_url.is.null,sides.is.null,tracklists.is.null');

    if (error) {
      console.error('Error fetching missing records:', error);
      setMessage('Error fetching missing records. Check console.');
      setLoading(false);
      return;
    }

    setMissingRecords(data);
    setMessage(`Found ${data.length} record(s) with missing data.`);
    setLoading(false);
  };

  const fetchFromDiscogs = async (artist, title) => {
    try {
      const query = `${artist} ${title}`;
      const response = await fetch(`https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&token=${DISCOGS_TOKEN}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return {
          image_url: data.results[0].cover_image || null,
          title: data.results[0].title || null,
        };
      }
    } catch (error) {
      console.error('Discogs fetch error:', error);
    }
    return null;
  };

  const fetchFromiTunes = async (artist, title) => {
    try {
      const query = `${artist} ${title}`;
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=1`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return {
          image_url: data.results[0].artworkUrl100.replace('100x100bb', '600x600bb') || null,
          title: data.results[0].collectionName || null,
        };
      }
    } catch (error) {
      console.error('iTunes fetch error:', error);
    }
    return null;
  };

  const fetchFromMusicBrainz = async (artist, title) => {
    try {
      const query = `${artist} ${title}`;
      const response = await fetch(`https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=1`);
      const data = await response.json();
      if (data.releases && data.releases.length > 0) {
        return {
          image_url: null,
          title: data.releases[0].title || null,
        };
      }
    } catch (error) {
      console.error('MusicBrainz fetch error:', error);
    }
    return null;
  };

  const backfillData = async () => {
    setLoading(true);
    setMessage('Starting real backfill...');

    for (const record of missingRecords) {
      const { id, artist, title } = record;

      let fetchedData = await fetchFromDiscogs(artist, title);
      if (!fetchedData) fetchedData = await fetchFromiTunes(artist, title);
      if (!fetchedData) fetchedData = await fetchFromMusicBrainz(artist, title);

      if (fetchedData) {
        await supabase
          .from('collection')
          .update({
            image_url: fetchedData.image_url || record.image_url,
            tracklists: fetchedData.title || record.tracklists,
          })
          .eq('id', id);
      }
    }

    setMessage('Real backfill complete! Please review in admin panel.');
    setLoading(false);
  };

  return (
    <div className="admin-section">
      <h2>Backfill Missing Data</h2>

      <button onClick={findMissingData} disabled={loading}>
        Find Missing Records
      </button>

      {missingRecords.length > 0 && (
        <button onClick={backfillData} disabled={loading}>
          Start Real Backfill
        </button>
      )}

      <p>{message}</p>

      {missingRecords.length > 0 && (
        <ul>
          {missingRecords.map((rec) => (
            <li key={rec.id}>{rec.artist} - {rec.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BackfillMissingData;
