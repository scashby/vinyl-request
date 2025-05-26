import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AddTrackListings = () => {
  // ===== State Section =====
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [rawTracklist, setRawTracklist] = useState('');
  const [parsedSides, setParsedSides] = useState(null);

  // ===== Fetch Albums on Load =====
  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    const { data, error } = await supabase.from('collection').select('*');
    if (error) {
      console.error('Error fetching albums:', error);
    } else {
      setAlbums(data);
    }
  }

  // ===== Discogs Tracklist Parser =====
  function parseDiscogsTracklist(rawText) {
    const lines = rawText.split('\n');
    const sides = {};
    let currentSide = null;

    for (let line of lines) {
      line = line.trim();
      if (line === '') continue;

      const match = line.match(/^([A-F])\d+\s+(.+)/);

      if (match) {
        const sideLetter = match[1];
        const trackTitle = match[2]
          .replace(/\s*Written[- ]By.*$/i, '')
          .replace(/\s*\d+:\d+$/, '')
          .trim();

        if (!sides[sideLetter]) sides[sideLetter] = [];
        sides[sideLetter].push(trackTitle);

        currentSide = sideLetter;
      } else if (currentSide) {
        continue;
      }
    }

    return sides;
  }

  // ===== Handlers =====
  function handleParseTracklist() {
    const parsed = parseDiscogsTracklist(rawTracklist);
    setParsedSides(parsed);
  }

  async function handleSaveTracklist() {
    if (!selectedAlbum || !parsedSides) return;
    const { error } = await supabase
      .from('collection')
      .update({ sides: parsedSides })
      .eq('id', selectedAlbum.id);
    if (error) {
      console.error('Error saving tracklist:', error);
    } else {
      console.log('Tracklist saved successfully!');
    }
  }

  // ===== Render =====
  return (
    <div style={{ padding: '20px' }}>
      <h2>Add or Edit Track Listings</h2>

      {/* Album Selector */}
      <div>
        <h4>Select Album:</h4>
        <select
          onChange={(e) => {
            const album = albums.find((a) => a.id === parseInt(e.target.value));
            setSelectedAlbum(album);
          }}
          value={selectedAlbum?.id || ''}
        >
          <option value="">-- Select an Album --</option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              {album.artist} – {album.title}
            </option>
          ))}
        </select>
      </div>

      {/* Raw Tracklist Paste */}
      {selectedAlbum && (
        <div style={{ marginTop: '20px' }}>
          <h4>Paste Discogs Tracklist:</h4>
          <textarea
            rows="10"
            style={{ width: '100%' }}
            value={rawTracklist}
            onChange={(e) => setRawTracklist(e.target.value)}
            placeholder="Paste raw tracklist here..."
          />
          <button onClick={handleParseTracklist} style={{ marginTop: '10px' }}>
            Parse Tracklist
          </button>
        </div>
      )}

      {/* Parsed Preview */}
      {parsedSides && (
        <div style={{ marginTop: '30px' }}>
          <h4>Parsed Tracklist Preview:</h4>
          {Object.entries(parsedSides).map(([side, tracks]) => (
            <div key={side} style={{ marginBottom: '10px' }}>
              <strong>Side {side}:</strong>
              <ul>
                {tracks.map((track, idx) => (
                  <li key={idx}>{track}</li>
                ))}
              </ul>
            </div>
          ))}
          <button onClick={handleSaveTracklist} style={{ marginTop: '20px' }}>
            Save Tracklist to Album
          </button>
        </div>
      )}
    </div>
  );
};

export default AddTrackListings;
