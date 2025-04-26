// src/admin/AddTrackListings.js

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AddTrackListings = () => {
  // --- State Management ---
  const [albums, setAlbums] = useState([]);
  const [sortField, setSortField] = useState('artist');
  const [saving, setSaving] = useState(false);

  // --- Fetch Albums on Load ---
  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    const { data, error } = await supabase.from('collection').select('*');
    if (error) {
      console.error('Error fetching albums:', error);
    } else {
      const sorted = data.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
      setAlbums(sorted);
    }
  }

  // --- Handlers for Editing and Saving ---
  function handleSidesChange(id, newSidesJson) {
    setAlbums((prevAlbums) =>
      prevAlbums.map((album) =>
        album.id === id ? { ...album, sides: newSidesJson } : album
      )
    );
  }

  async function handleSave(album) {
    setSaving(true);
    let parsedSides;
    try {
      parsedSides = JSON.parse(album.sides);
    } catch (err) {
      alert('Invalid JSON format! Please check and try again.');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('collection')
      .update({ sides: parsedSides })
      .eq('id', album.id);

    if (error) {
      console.error('Failed to update track listings:', error);
      alert('Failed to update sides. Check console for details.');
    } else {
      console.log('Sides updated successfully for', album.artist, album.title);
    }
    setSaving(false);
  }

  async function handleSaveAll() {
    for (const album of albums) {
      if (album.sides) {
        await handleSave(album);
      }
    }
    console.log('All albums with sides saved.');
  }

  function handleSort(field) {
    setSortField(field);
    const sorted = [...albums].sort((a, b) =>
      (a[field] || '').localeCompare(b[field] || '')
    );
    setAlbums(sorted);
  }

  // --- Render ---
  return (
    <div style={{ padding: '20px' }}>
      <h2>📖 Add or Edit Track Listings (Sides & Tracks)</h2>
      <button onClick={handleSaveAll} style={{ marginBottom: '10px' }}>Save All</button>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th onClick={() => handleSort('artist')} style={{ cursor: 'pointer' }}>Artist</th>
            <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>Title</th>
            <th>Sides JSON</th>
            <th>Save</th>
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
                  value={album.sides ? JSON.stringify(album.sides, null, 2) : ''}
                  onChange={(e) => handleSidesChange(album.id, e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => handleSave(album)} disabled={saving}>
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSaveAll} style={{ marginTop: '10px' }}>Save All</button>
    </div>
  );
};

export default AddTrackListings;
