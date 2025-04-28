// ✅ Imports
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/BrowseAlbums.css';
import FilterBar from './FilterBar';

// ✅ BrowseAlbums component
const BrowseAlbums = ({
  activeEventId,
  handleSubmit,
  expandedId,
  setExpandedId,
  side,
  setSide,
  name,
  setName,
}) => {
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('All');

  // ✅ Fetch albums on mount
  useEffect(() => {
    const fetchAlbums = async () => {
      console.log('fetchAlbums function is running');

      const { data, error } = await supabase
        .from('collection')
        .select('*')
        .order('artist', { ascending: true });

      console.log('Albums fetched from Supabase:', data ? data.length : 'No data');

      if (error) {
        console.error('Error fetching albums:', error);
        return;
      }

      setAlbums(data);
      setFilteredAlbums(data);
    };

    fetchAlbums();
  }, []);

  // ✅ Filter albums when search term or media type changes
  useEffect(() => {
    let filtered = albums;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (album) =>
          album.title?.toLowerCase().includes(term) ||
          album.artist?.toLowerCase().includes(term)
      );
    }

    if (mediaType !== 'All') {
      filtered = filtered.filter((album) => album.folder === mediaType);
    }

    setFilteredAlbums(filtered);
  }, [searchTerm, mediaType, albums]);

  // ✅ Handle album click
  const handleAlbumClick = (albumId) => {
    setExpandedId(albumId === expandedId ? null : albumId);
    setSide('A');
  };

  // ✅ Render component
  return (
    <div className="browse-albums">
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by artist or title"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterBar mediaType={mediaType} setMediaType={setMediaType} />
      </div>

      {/* 🛠 Restored album-grid rendering */}
      <div className="album-grid">
        {filteredAlbums.map((album) => (
          <div
            key={album.id}
            className="album-card"
            onClick={() => handleAlbumClick(album.id)}
          >
            <div style={{ position: 'relative', width: '100%', height: '150px' }}>
              {album.image_url && album.image_url !== 'no' ? (
                <img
                  src={album.image_url}
                  alt={`${album.artist} - ${album.title}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    console.error('Image load failed for:', album.artist, album.title);
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* ✅ Placeholder black box if no image */}
              <div
                className="album-placeholder"
                style={{
                  display: (!album.image_url || album.image_url === 'no') ? 'flex' : 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'black',
                  color: 'white',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '5px',
                  fontSize: '0.9em',
                }}
              >
                {album.artist} – {album.title}
              </div>
            </div>

            {/* ✅ Album info under image/placeholder */}
            <div
              className="album-info-text"
              style={{ marginTop: '5px', textAlign: 'center', fontSize: '0.85em' }}
            >
              {album.artist} – {album.title}
            </div>

            {/* ✅ Request form if album is expanded */}
            {expandedId === album.id && (
              <div className="request-form">
                <select value={side} onChange={(e) => setSide(e.target.value)}>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((s) => (
                    <option key={s} value={s}>
                      Side {s}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button onClick={() => handleSubmit(album)}>Add to Queue</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseAlbums;
