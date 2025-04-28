// ✅ Imports
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// ✅ AddAlbumArt component
const AddAlbumArt = () => {
  // ✅ Local component state
  const [albums, setAlbums] = useState([]);
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');

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

  // ✅ Handle clicking 'Edit' button for an album
  const handleEditClick = (albumId) => {
    setEditingAlbumId(albumId);
    const album = albums.find((a) => a.id === albumId);
    setNewImageUrl(album?.image_url || '');
  };

  // ✅ Handle Save button click to update image URL
  const handleSaveClick = async (albumId) => {
    if (!newImageUrl.trim()) {
      alert('Please enter a valid image URL.');
      return;
    }

    const { error } = await supabase
      .from('collection')
      .update({ image_url: newImageUrl })
      .eq('id', albumId);

    if (error) {
      console.error('Error updating image URL:', error);
      alert('Failed to update image URL.');
    } else {
      alert('Image URL updated successfully.');
      // 🛠 Refresh albums after save
      const { data: updatedAlbums } = await supabase
        .from('collection')
        .select('*')
        .order('artist', { ascending: true });

      setAlbums(updatedAlbums);
      setEditingAlbumId(null);
      setNewImageUrl('');
    }
  };

  return (
    <div className="admin-page">
      <h2>Replace Album Art</h2>

      {/* ✅ Album list */}
      {albums.map((album) => (
        <div key={album.id} className="album-edit-card">
          <div style={{ marginBottom: '8px' }}>
            <strong>{album.artist}</strong> – {album.title}
          </div>

          {/* ✅ If editing this album */}
          {editingAlbumId === album.id ? (
            <div>
              {/* 🛠 Input field controlled by state */}
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter new album art URL"
                style={{ width: '300px', marginRight: '10px' }}
              />
              {/* ✅ Save button triggers update */}
              <button onClick={() => handleSaveClick(album.id)}>Save</button>
              {/* ✅ Cancel button restores original view */}
              <button onClick={() => { setEditingAlbumId(null); setNewImageUrl(''); }} style={{ marginLeft: '10px' }}>
                Cancel
              </button>
            </div>
          ) : (
            <div>
              {/* ✅ Edit button shows input */}
              <button onClick={() => handleEditClick(album.id)}>Edit Artwork</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AddAlbumArt;
