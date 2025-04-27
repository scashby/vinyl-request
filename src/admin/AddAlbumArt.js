import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AddAlbumArt = () => {
  // ===== State Section =====
  const [albums, setAlbums] = useState([]);
  const [onlyMissingArt, setOnlyMissingArt] = useState(false);
  const [sortField, setSortField] = useState('artist');
  const [isBoxSet, setIsBoxSet] = useState(false);
  const [subAlbums, setSubAlbums] = useState([]);

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

  // ===== Input Handlers =====
  function handleInputChange(id, field, value) {
    setAlbums(prev =>
      prev.map(album =>
        album.id === id ? { ...album, [field]: value } : album
      )
    );
  }

  function handleSubAlbumChange(index, field, value) {
    setSubAlbums(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  }

  // ===== Save Handlers =====
  async function handleSave(album) {
    const updates = {
      artist: album.artist,
      title: album.title,
      image_url: album.image_url,
    };
    const { error } = await supabase.from('collection').update(updates).eq('id', album.id);
    if (error) {
      console.error('Error updating album:', error);
    } else {
      console.log('Album updated successfully');
    }
  }

  async function handleSaveAll() {
    for (const album of albums) {
      await handleSave(album);
    }
    console.log('All albums saved.');
  }

  async function handleSaveSubAlbum(subAlbum) {
    const { error } = await supabase.from('collection').insert([subAlbum]);
    if (error) {
      console.error('Error saving sub-album:', error);
    } else {
      console.log('Sub-album saved successfully');
    }
  }

  // ===== Sorting =====
  function handleSort(field) {
    setSortField(field);
    const sorted = [...albums].sort((a, b) =>
      (a[field] || '').localeCompare(b[field] || '')
    );
    setAlbums(sorted);
  }

  const filteredAlbums = onlyMissingArt
    ? albums.filter(album => !album.image_url || album.image_url === 'no')
    : albums;

  // ===== Render =====
  return (
    <div style={{ padding: '20px' }}>
      <h2>Add or Edit Album Art</h2>

      {/* Top Controls */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          <input
            type="checkbox"
            checked={onlyMissingArt}
            onChange={() => setOnlyMissingArt(prev => !prev)}
          /> Show Only Missing Artwork
        </label>

        <button onClick={handleSaveAll} style={{ marginLeft: '10px' }}>
          Save All
        </button>

        <label style={{ marginLeft: '20px' }}>
          <input
            type="checkbox"
            checked={isBoxSet}
            onChange={() => setIsBoxSet(prev => !prev)}
          /> Box Set
        </label>
      </div>

      {/* Album Table */}
      <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Image</th>
            <th onClick={() => handleSort('artist')} style={{ cursor: 'pointer' }}>Artist</th>
            <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>Title</th>
            <th>Image URL</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody>
          {filteredAlbums.map(album => (
            <tr key={album.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td>
                {album.image_url && album.image_url !== 'no' ? (
                  <img src={album.image_url} alt={album.title} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', backgroundColor: 'black' }} />
                )}
              </td>
              <td>
                <input
                  value={album.artist || ''}
                  onChange={(e) => handleInputChange(album.id, 'artist', e.target.value)}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  value={album.title || ''}
                  onChange={(e) => handleInputChange(album.id, 'title', e.target.value)}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  value={album.image_url === 'no' ? '' : album.image_url || ''}
                  onChange={(e) => handleInputChange(album.id, 'image_url', e.target.value)}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <button onClick={() => handleSave(album)}>Save</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Box Set Sub-Album Section */}
      {isBoxSet && (
        <div style={{ marginTop: '40px' }}>
          <h3>Sub-Albums for Box Set</h3>
          <button onClick={() => setSubAlbums(prev => [...prev, { artist: '', title: '', image_url: '' }])}>
            Add Sub-Album
          </button>

          {subAlbums.map((sub, idx) => (
            <div key={idx} style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <input
                placeholder="Artist"
                value={sub.artist}
                onChange={(e) => handleSubAlbumChange(idx, 'artist', e.target.value)}
              />
              <input
                placeholder="Title"
                value={sub.title}
                onChange={(e) => handleSubAlbumChange(idx, 'title', e.target.value)}
              />
              <input
                placeholder="Image URL"
                value={sub.image_url}
                onChange={(e) => handleSubAlbumChange(idx, 'image_url', e.target.value)}
              />
              <button onClick={() => handleSaveSubAlbum(sub)}>Save Sub-Album</button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Save All Button */}
      <div style={{ marginTop: '30px' }}>
        <button onClick={handleSaveAll}>Save All</button>
      </div>
    </div>
  );
};

export default AddAlbumArt;
