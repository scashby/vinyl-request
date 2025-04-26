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
        .or('image_url.eq.no,image_url.is.null')
        .order('artist', { ascending: true });


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

  const handleSave = async (id, artist, title, imageUrl) => {
    setSaving(true);
  
    const cleanImageUrl = imageUrl?.startsWith('no') ? imageUrl.slice(2) : imageUrl;
  
    const { error } = await supabase
      .from('collection')
      .update({ artist, title, image_url: cleanImageUrl })
      .eq('id', id);
  
    if (error) {
      console.error('Failed to update album:', error);
    }
    setSaving(false);
  };
  
  
  const handleArtistChange = (id, newArtist) => {
    setAlbums((prev) =>
      prev.map((album) =>
        album.id === id ? { ...album, artist: newArtist } : album
      )
    );
  };
  
  const handleTitleChange = (id, newTitle) => {
    setAlbums((prev) =>
      prev.map((album) =>
        album.id === id ? { ...album, title: newTitle } : album
      )
    );
  };
  const handleSaveAll = async () => {
    setSaving(true);
    for (const album of albums) {
      const { error } = await supabase
        .from('collection')
        .update({
          artist: album.artist,
          title: album.title,
          image_url: album.image_url,
        })
        .eq('id', album.id);
  
      if (error) {
        console.error(`Failed to update album ID ${album.id}:`, error);
      }
    }
    alert('All changes saved!');
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
                    <td>
                      <input
                        type="text"
                        value={album.artist || ''}
                        onChange={(e) => handleArtistChange(album.id, e.target.value)}
                        style={{ width: '90%' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={album.title || ''}
                        onChange={(e) => handleTitleChange(album.id, e.target.value)}
                        style={{ width: '90%' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={album.image_url || ''}
                        onChange={(e) => handleImageUrlChange(album.id, e.target.value)}
                        style={{ width: '90%' }}
                      />
                    </td>
                    <td>
                    <button onClick={() => handleSave(album.id, album.artist, album.title, album.image_url)} disabled={saving}>
                      Save
                    </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', paddingTop: '10px' }}>
                    <button onClick={handleSaveAll} disabled={saving}>
                      Save All Changes
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AddAlbumArt;
