// src/admin/AddTrackListings.js

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AddTrackListings = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAlbumsMissingTracks = async () => {
      const { data, error } = await supabase
        .from('collection')
        .select('*')
        .is('sides', null);

      if (error) {
        console.error('Error fetching albums:', error);
      } else {
        setAlbums(data);
      }
      setLoading(false);
    };

    fetchAlbumsMissingTracks();
  }, []);

  const handleSidesChange = (id, newSidesJson) => {
    setAlbums((prevAlbums) =>
      prevAlbums.map((album) =>
        album.id === id ? { ...album, sides: newSidesJson } : album
      )
    );
  };

  const handleSave = async (id, sides) => {
    setSaving(true);
    let parsedSides;
    try {
      parsedSides = JSON.parse(sides);
    } catch (err) {
      alert('Invalid JSON format! Please check and try again.');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('collection')
      .update({ sides: parsedSides })
      .eq('id', id);

    if (error) {
      console.error('Failed to update track listings:', error);
      alert('Failed to update sides. Check console for details.');
    } else {
      alert('Sides updated successfully!');
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📖 Add or Edit Track Listings (Sides & Tracks)</h2>
      {loading ? (
        <p>Loading albums...</p>
      ) : (
        <div>
          {albums.length === 0 ? (
            <p>All albums already have track listings!</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Artist</th>
                  <th>Title</th>
                  <th>Sides JSON</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {albums.map((album) => (
                  <tr key={album.id} style={{ borderBottom: '1px solid #ccc' }}>
                    <td>{album.artist}</td>
                    <td>{album.title}</td>
                    <td>
                      <textarea
                        rows={6}
                        cols={40}
                        placeholder='{ "A": ["Track 1", "Track 2"], "B": ["Track 3"] }'
                        value={album.sides || ''}
                        onChange={(e) => handleSidesChange(album.id, e.target.value)}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleSave(album.id, album.sides)} disabled={saving}>
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AddTrackListings;
