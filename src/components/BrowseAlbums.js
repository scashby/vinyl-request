import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import 'css/BrowseAlbums.css';
import FilterBar from './FilterBar';
import { fetchAlbumCoverWithFallbacks } from '../api/fetchAlbumCoverWithFallbacks';
import ExpandedAlbumCard from './ExpandedAlbumCard'; // ✅ NEW: Expanded album block

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
  // ✅ Main local states
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('All');

  // ✅ Fetch album collection from Supabase
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

  // ✅ Apply search and media type filters when inputs change
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

  // ✅ Handle clicking an album to expand/collapse
  const handleAlbumClick = (albumId) => {
    setExpandedId(albumId === expandedId ? null : albumId); // Toggle expand
    setSide('A'); // Default to side A
  };

  // ✅ Handle submitting a request from the expanded album card
  const handleExpandedSubmit = (album, selectedSide, userName) => {
    setSide(selectedSide);
    setName(userName);
    handleSubmit(album);
    setExpandedId(null); // Collapse expanded view after submit
  };

  return (
    <div className="browse-albums">

      {/* ✅ Search bar and media type filter */}
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

      {/* ✅ Album grid */}
      <div className="album-grid">
        {filteredAlbums.map((album) => (
          <div
            key={album.id}
            className="album-card"
            style={{ cursor: 'pointer', padding: '10px' }}
          >
            {/* ✅ Small album cover and text (always visible) */}
            <div
              onClick={() => handleAlbumClick(album.id)}
              style={{ position: 'relative', width: '100%', height: '150px' }}
            >
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
              ) : null}

              {/* Fallback for missing album image */}
              <div
                className="album-placeholder"
                style={{
                  display: !album.image_url ? 'flex' : 'none',
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

            {/* ✅ Artist and album title below cover */}
            <div
              className="album-info-text"
              style={{ marginTop: '5px', textAlign: 'center', fontSize: '0.85em', wordWrap: 'break-word' }}
            >
              {album.artist} – {album.title}
            </div>

            {/* ✅ Expanded view appears inline when this album is expanded */}
            {expandedId === album.id && (
              <ExpandedAlbumCard
                album={album}
                onClose={() => setExpandedId(null)}
                onSubmitRequest={handleExpandedSubmit}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseAlbums;
