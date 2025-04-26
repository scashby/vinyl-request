// src/admin/AddAlbumArt.js

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AddAlbumArt = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAlbumsMissingArt = async () => {
      const { data, error } = await supabase
        .from('collection')
        .select('*')
        .or('image_url.eq.no,image_url.is.null');

      if (error) {
        console.error('Error fetching albums:', error);
      } else {
        setAlbums(data);
      }
      setLoading(false);
    };

    fetchAlbumsMissingArt();
  }, []);

  const handleImageUrlChange = (id, newImageUrl) => {
    setAlbums((prevAlbums) =>
      prevAlbums.map((album) =>
        album.id === id ? { ...album, image_url: newImageUrl } : album
      )
    );
  };

  const handleSave = async (id, imageUrl) => {
    setSaving(true);
    const { error } = await supabase
      .from('collection')
      .update({ image_url: imageUrl })
      .eq('id', id);

    if (error) {
      console.error('Failed to update image_url:', error);
      alert('Failed to update image URL. Check console for details.');
    } else {
      alert('Image URL updated successfully!');
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🖼️ Add Album Art (Manual Fix)</h2>
      {loading ? (
        <p>Loading albums...</p>
      ) : (
        <div>
          {albums.length === 0 ? (
            <p>No albums missing artwork!</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Artist</th>
                  <th>Title</th>
                  <th>Image URL</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {albums.map((album) => (
                  <tr key={album.id} style={{ borderBottom: '1px solid #ccc' }}>
                    <td>{album.artist}</td>
                    <td>{album.title}</td>
                    <td>
                      <input
                        type="text"
                        value={album.image_url || ''}
                        onChange={(e) => handleImageUrlChange(album.id, e.target.value)}
                        style={{ width: '90%' }}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleSave(album.id, album.image_url)} disabled={saving}>
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

export default AddAlbumArt;
