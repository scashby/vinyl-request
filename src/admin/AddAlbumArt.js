import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AddAlbumArt = () => {
  const [albums, setAlbums] = useState([]);
  const [onlyMissingArt, setOnlyMissingArt] = useState(false);
  const [sortField, setSortField] = useState('artist');

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

  function handleInputChange(id, field, value) {
    setAlbums(prev =>
      prev.map(album =>
        album.id === id ? { ...album, [field]: value } : album
      )
    );
  }

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

  return (
    <div style={{ padding: '20px' }}>
      <h2>Add or Edit Album Art</h2>
      <button onClick={() => setOnlyMissingArt(prev => !prev)}>
        {onlyMissingArt ? 'Show All' : 'Show Only Missing Artwork'}
      </button>
      <button onClick={handleSaveAll} style={{ marginLeft: '10px' }}>Save All</button>
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
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
    </div>
  );
};

export default AddAlbumArt;
