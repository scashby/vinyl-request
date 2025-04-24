import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/BrowseAlbums.css';
import FilterBar from './FilterBar';

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
        setFilteredAlbums(data);
      }
    };

    fetchAlbums();
  }, []);

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

  const handleAlbumClick = (albumId) => {
    setExpandedId(albumId === expandedId ? null : albumId);
    setSide('A');
  };

  return (
    <div className="browse-albums">
      <div className="browse-header">
        <h2>Browse Our Collection</h2>
        <button onClick={() => setExpandedId(null)}>Hide Collection</button>
      </div>

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

      <div className="album-grid">
        {filteredAlbums.map((album) => (
          <div
            key={album.id}
            className="album-card"
            onClick={() => handleAlbumClick(album.id)}
          >
            {album.image_url ? (
              <img src={album.image_url} alt={`${album.artist} - ${album.title}`} className="album-image" />
            ) : (
              <div className="album-placeholder">
                <div>{album.artist}</div>
                <div><strong>{album.title}</strong></div>
              </div>
            )}
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
