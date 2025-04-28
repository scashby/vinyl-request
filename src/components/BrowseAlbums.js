// ✅ Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/BrowseAlbums.css'; // ✅ Corrected relative CSS import
import FilterBar from './FilterBar';
import { fetchAlbumCoverWithFallbacks } from '../api/fetchAlbumCoverWithFallbacks';

// ✅ Main BrowseAlbums Component
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
  // ✅ Local component states
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('All');

  // ✅ Fetch albums from Supabase on initial mount
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

      const albumsWithImages = await Promise.all(
        data.map(async (album) => {
          let updatedAlbum = { ...album };

          if (!album.image_url || album.image_url === 'no') {
            console.log('Fetching cover for:', album.artist, album.title);
            const { imageUrl, sides } = await fetchAlbumCoverWithFallbacks(album.artist, album.title, album.id);
            const imageStatus = imageUrl ? imageUrl : 'no';
            if (sides) {
              updatedAlbum.sides = sides;
            }

            const { error: updateError } = await supabase
              .from('collection')
              .update({ image_url: imageStatus })
              .eq('id', album.id);

            if (updateError) {
              console.error('Failed to update image_url in Supabase for', album.artist, album.title, updateError);
            } else {
              console.log(`Successfully updated Supabase: ${album.artist} - ${album.title} ➔ ${imageStatus}`);
            }

            updatedAlbum.image_url = imageStatus;
          }

          return updatedAlbum;
        })
      );

      setAlbums(albumsWithImages);
      setFilteredAlbums(albumsWithImages);
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

  // ✅ Handle clicking on an album to expand/collapse
  const handleAlbumClick = (albumId) => {
    setExpandedId(albumId === expandedId ? null : albumId);
    setSide('A');
  };

  // ✅ Main render output
  return (
    <div className="browse-albums">
      {/* ✅ Search bar and filter controls */}
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

      {/* 🛠 Added: Restored album-grid and album-card rendering based on working backup */}
      <div className="album-grid">
        {filteredAlbums.map((album) => (
          <div
            key={album.id}
            className="album-card"
            onClick={() => handleAlbumClick(album.id)}
          >
            <div style={{ position: 'relative', width: '100%', height: '150px' }}>
              {album.image_url ? (
                <img
                  src={album.image_url}
                  alt={`${album.artist} - ${album.title}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : (
                <div
                  className="album-placeholder"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '5px',
                    fontSize: '0.9em',
                  }}
                >
                  {album.artist} – {album.title}
                </div>
              )}
            </div>

            {/* ✅ Album info text below each album */}
            <div
              className="album-info-text"
              style={{ marginTop: '5px', textAlign: 'center', fontSize: '0.85em' }}
            >
              {album.artist} – {album.title}
            </div>

            {/* ✅ Request form (expandable section) */}
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
