 // ✅ Imports
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// ✅ AddAlbumArt Component
const AddAlbumArt = () => {
  // ✅ Local component state
  const [albums, setAlbums] = useState([]);
  const [editedAlbums, setEditedAlbums] = useState({});

  // ✅ Fetch albums from Supabase on mount
  useEffect(() => {
    const fetchAlbums = async () => {
      const { data, error } = await supabase
        .from('collection')
        .select('*')
        .order('artist', { ascending: true });

      if (error) {
        console.error('Error fetching albums:', error);
      } else {
        setAlbums(data);
      }
    };

    fetchAlbums();
  }, []);

  // ✅ Handle typing into input fields (update local editedAlbums immediately)
  const handleFieldChange = (albumId, field, value) => {
    setEditedAlbums(prev => ({
      ...prev,
      [albumId]: {
        ...prev[albumId],
        [field]: value,
      }
    }));
  };

  // ✅ Handle Save All Changes button click
  const handleSaveAll = async () => {
    const updates = Object.entries(editedAlbums).map(([id, fields]) => ({
      id: parseInt(id, 10),
      ...fields,
    }));

    if (updates.length === 0) {
      alert('No changes to save.');
      return;
    }

    const { error } = await supabase
      .from('collection')
      .upsert(updates, { onConflict: ['id'] });

    if (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes.');
    } else {
      alert('Changes saved successfully.');
      setEditedAlbums({});

      // 🛠 Refresh albums after save
      const { data: updatedData } = await supabase
        .from('collection')
        .select('*')
        .order('artist', { ascending: true });

      setAlbums(updatedData);
    }
  };

  return (
    <div className="admin-page">
      <h2>Replace Album Artwork</h2>

      {/* ✅ Save All Changes button at the top */}
      <button onClick={handleSaveAll} style={{ marginBottom: '20px' }}>
        Save All Changes
      </button>

      {/* ✅ Album List */}
      {albums.map((album) => {
        const edited = editedAlbums[album.id] || {};

        return (
          <div key={album.id} className="album-edit-card" style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
            {/* ✅ Artwork Preview */}
            <div style={{ marginBottom: '8px' }}>
              {album.image_url ? (
                <img
                  src={edited.image_url || album.image_url}
                  alt={`${album.artist} - ${album.title}`}
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-placeholder.png'; // Optional: Add fallback placeholder image
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: 'black',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8em',
                  }}
                >
                  No Image
                </div>
              )}
            </div>

            {/* ✅ Editable fields */}
            <div>
              <div style={{ marginBottom: '8px' }}>
                <label><strong>Artist:</strong></label><br />
                <input
                  type="text"
                  value={edited.artist ?? album.artist}
                  onChange={(e) => handleFieldChange(album.id, 'artist', e.target.value)}
                  style={{ width: '300px' }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label><strong>Title:</strong></label><br />
                <input
                  type="text"
                  value={edited.title ?? album.title}
                  onChange={(e) => handleFieldChange(album.id, 'title', e.target.value)}
                  style={{ width: '300px' }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label><strong>Artwork URL:</strong></label><br />
                <input
                  type="text"
                  value={edited.image_url ?? album.image_url}
                  onChange={(e) => handleFieldChange(album.id, 'image_url', e.target.value)}
                  style={{ width: '300px' }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* ✅ Save All Changes button at the bottom */}
      <button onClick={handleSaveAll} style={{ marginTop: '20px' }}>
        Save All Changes
      </button>
    </div>
  );
};

export default AddAlbumArt;
