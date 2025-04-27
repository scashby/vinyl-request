import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AddTrackListings = () => {
  // ===== State Section =====
  const [albums, setAlbums] = useState([]);
  const [subAlbumsMap, setSubAlbumsMap] = useState({});

  // ===== Fetch Albums on Load =====
  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    const { data, error } = await supabase.from('collection').select('*');
    if (error) {
      console.error('Error fetching albums:', error);
    } else {
      const parents = data.filter(album => !album.parent_id);
      const subs = data.filter(album => album.parent_id);
      const subMap = {};
      for (const sub of subs) {
        if (!subMap[sub.parent_id]) subMap[sub.parent_id] = [];
        subMap[sub.parent_id].push(sub);
      }
      setAlbums(parents);
      setSubAlbumsMap(subMap);
    }
  }

  // ===== Input Handlers =====
  function handleInputChange(id, field, value, isSub = false, parentId = null) {
    if (isSub && parentId) {
      setSubAlbumsMap(prev => {
        const updated = { ...prev };
        updated[parentId] = updated[parentId].map(album =>
          album.id === id ? { ...album, [field]: value } : album
        );
        return updated;
      });
    } else {
      setAlbums(prev =>
        prev.map(album =>
          album.id === id ? { ...album, [field]: value } : album
        )
      );
    }
  }

  async function handleSave(album) {
    const updates = {
      artist: album.artist,
      title: album.title,
      sides: album.sides,
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
      if (subAlbumsMap[album.id]) {
        for (const sub of subAlbumsMap[album.id]) {
          await handleSave(sub);
        }
      }
    }
    console.log('All albums and sub-albums saved.');
  }

  async function handleSaveNewSubAlbum(parentId) {
    const { data, error } = await supabase
      .from('collection')
      .insert([{ artist: '', title: '', sides: null, parent_id: parentId }])
      .select();
    if (error) {
      console.error('Error adding sub-album:', error);
    } else {
      setSubAlbumsMap(prev => {
        const updated = { ...prev };
        updated[parentId] = [...(updated[parentId] || []), data[0]];
        return updated;
      });
    }
  }

  // ===== Render Album and Sub-Album Forms =====
  return (
    <div style={{ padding: '20px' }}>
      <h2>Add or Edit Track Listings</h2>

      <button onClick={handleSaveAll} style={{ marginBottom: '20px' }}>Save All</button>

      {albums.map(album => (
        <div key={album.id} style={{ marginBottom: '40px', borderBottom: '2px solid #ccc', paddingBottom: '20px' }}>
          <h3>{album.artist} – {album.title}</h3>

          <textarea
            placeholder="Enter tracklist here (Side A/B, etc.)"
            value={album.sides || ''}
            onChange={(e) => handleInputChange(album.id, 'sides', e.target.value)}
            style={{ width: '100%', height: '150px', marginBottom: '10px' }}
          />

          <button onClick={() => handleSave(album)}>Save Album</button>

          {/* Sub-Albums Section */}
          {subAlbumsMap[album.id] && (
            <div style={{ marginTop: '20px', paddingLeft: '20px', borderLeft: '3px solid #888' }}>
              <h4>Sub-Albums</h4>
              {subAlbumsMap[album.id].map(sub => (
                <div key={sub.id} style={{ marginBottom: '20px' }}>
                  <strong>Sub-Album Artist:</strong>
                  <input
                    value={sub.artist || ''}
                    onChange={(e) => handleInputChange(sub.id, 'artist', e.target.value, true, album.id)}
                    style={{ width: '100%', marginBottom: '5px' }}
                  />
                  <strong>Sub-Album Title:</strong>
                  <input
                    value={sub.title || ''}
                    onChange={(e) => handleInputChange(sub.id, 'title', e.target.value, true, album.id)}
                    style={{ width: '100%', marginBottom: '5px' }}
                  />
                  <textarea
                    placeholder="Enter tracklist here (Side A/B, etc.)"
                    value={sub.sides || ''}
                    onChange={(e) => handleInputChange(sub.id, 'sides', e.target.value, true, album.id)}
                    style={{ width: '100%', height: '120px' }}
                  />
                  <button onClick={() => handleSave(sub)} style={{ marginTop: '5px' }}>Save Sub-Album</button>
                </div>
              ))}

              <button onClick={() => handleSaveNewSubAlbum(album.id)} style={{ marginTop: '10px' }}>➕ Add New Sub-Album</button>
            </div>
          )}

        </div>
      ))}

      <div style={{ marginTop: '30px' }}>
        <button onClick={handleSaveAll}>Save All</button>
      </div>
    </div>
  );
};

export default AddTrackListings;
