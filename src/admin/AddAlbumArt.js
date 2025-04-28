// ✅ Imports
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// ✅ AddAlbumArt Component
const AddAlbumArt = () => {
  const [albums, setAlbums] = useState([]);
  const [editedAlbums, setEditedAlbums] = useState({});
  const [showMissingArtOnly, setShowMissingArtOnly] = useState(false);

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

  // ✅ Handle field edits
  const handleFieldChange = (albumId, field, value) => {
    setEditedAlbums(prev => ({
      ...prev,
      [albumId]: {
        ...prev[albumId],
        [field]: value,
      }
    }));
  };

  // ✅ Handle checkbox edits for Box Set
  const handleCheckboxChange = (albumId, field, checked) => {
    setEditedAlbums(prev => ({
      ...prev,
      [albumId]: {
        ...prev[albumId],
        [field]: checked,
      }
    }));
  };

  // ✅ Save a single album
  const handleSaveSingle = async (albumId) => {
    const fields = editedAlbums[albumId];
    if (!fields) {
      alert('No changes to save.');
      return;
    }

    const { error } = await supabase
      .from('collection')
      .update(fields)
      .eq('id', albumId);

    if (error) {
      console.error('Error saving album:', error);
      alert('Failed to save album.');
    } else {
      alert('Album saved successfully.');
      setEditedAlbums(prev => {
        const updated = { ...prev };
        delete updated[albumId];
        return updated;
      });

      const { data: updatedData } = await supabase
        .from('collection')
        .select('*')
        .order('artist', { ascending: true });

      setAlbums(updatedData);
    }
  };

  // ✅ Save all edited albums
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
      console.error('Error saving albums:', error);
      alert('Failed to save changes.');
    } else {
      alert('All changes saved successfully.');
      setEditedAlbums({});

      const { data: updatedData } = await supabase
        .from('collection')
        .select('*')
        .order('artist', { ascending: true });

      setAlbums(updatedData);
    }
  };

  // ✅ Toggle show only missing artwork
  const toggleShowMissingArtOnly = () => {
    setShowMissingArtOnly(!showMissingArtOnly);
  };

  return (
    <div className="admin-page">
      <h2>Replace Album Artwork</h2>

      {/* ✅ Show Missing Artwork Only Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={showMissingArtOnly}
            onChange={toggleShowMissingArtOnly}
          />
          {' '}Show Only Albums Missing Artwork
        </label>
      </div>

      {/* ✅ Save All Changes button at the top */}
      <button onClick={handleSaveAll} style={{ marginBottom: '20px' }}>
        Save All Changes
      </button>

      {/* ✅ Album List */}
      {albums
        .filter(album => !showMissingArtOnly || !album.image_url || album.image_url === 'no')
        .map((album) => {
          const edited = editedAlbums[album.id] || {};

          const currentImageUrl = edited.image_url ?? album.image_url;

          return (
            <div key={album.id} className="album-edit-card" style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
              {/* ✅ Artwork Preview or Black Box */}
              <div style={{ marginBottom: '8px' }}>
                {(currentImageUrl && currentImageUrl !== 'no') ? (
                  <img
                    src={currentImageUrl}
                    alt={`${album.artist} - ${album.title}`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      backgroundColor: 'black',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                )}
              </div>

              {/* ✅ Editable Fields */}
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

                <div style={{ marginBottom: '8px' }}>
                  <label><strong>Box Set:</strong></label>{' '}
                  <input
                    type="checkbox"
                    checked={(edited.box_set ?? album.box_set) || false}
                    onChange={(e) => handleCheckboxChange(album.id, 'box_set', e.target.checked)}
                  />
                </div>

                {/* ✅ Save button per album */}
                <button onClick={() => handleSaveSingle(album.id)} style={{ marginTop: '10px' }}>
                  Save This Album
                </button>
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
