import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AddAlbumArt = () => {
  const [albums, setAlbums] = useState([]);
  const [sortBy, setSortBy] = useState('artist');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

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

  const handleSave = async (id, artist, title, imageUrl) => {
    setSaving(true);

    const cleanImageUrl = imageUrl?.startsWith('no') ? imageUrl.slice(2) : imageUrl;

    const { error } = await supabase
      .from('collection')
      .update({ artist, title, image_url: cleanImageUrl })
      .eq('id', id);

    if (error) {
      console.error('Failed to update album:', error);
    } else {
      fetchAlbums(); // Refresh after save
    }
    setSaving(false);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedAlbums = [...albums]
    .filter((album) => {
      if (showOnlyMissing) {
        return !album.image_url || album.image_url === 'no';
      }
      return true;
    })
    .sort((a, b) => {
      const aField = a[sortBy]?.toLowerCase() || '';
      const bField = b[sortBy]?.toLowerCase() || '';
      if (aField < bField) return sortOrder === 'asc' ? -1 : 1;
      if (aField > bField) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Album Art</h2>
      <button onClick={() => setShowOnlyMissing(!showOnlyMissing)} style={{ marginBottom: '10px' }}>
        {showOnlyMissing ? 'Show All Albums' : 'Show Only Missing Art'}
      </button>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Cover</th>
            <th onClick={() => handleSort('artist')} style={{ cursor: 'pointer' }}>Artist</th>
            <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>Title</th>
            <th>Image URL</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody>
          {sortedAlbums.map((album) => (
            <tr key={album.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td>
                {album.image_url && album.image_url !== 'no' ? (
                  <img
                    src={album.image_url}
                    alt="album cover"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.style.backgroundColor = 'black';
                    }}
                  />
                ) : (
                  <div style={{ width: '50px', height: '50px', backgroundColor: 'black' }} />
                )}
              </td>
              <td>
                <input
                  type="text"
                  defaultValue={album.artist}
                  onChange={(e) => (album.artist = e.target.value)}
                  style={{ width: '90%' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  defaultValue={album.title}
                  onChange={(e) => (album.title = e.target.value)}
                  style={{ width: '90%' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  defaultValue={album.image_url === 'no' ? '' : album.image_url}
                  onChange={(e) => (album.image_url = e.target.value)}
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
      </table>
    </div>
  );
};

export default AddAlbumArt;
