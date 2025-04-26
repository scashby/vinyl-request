import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import 'css/BrowseAlbums.css';
import FilterBar from './FilterBar';
import axios from 'axios';
import { fetchAlbumCoverWithFallbacks } from '../api/fetchAlbumCoverWithFallbacks';


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
          console.log('Processing album:', album.artist, album.title, 'Image URL:', album.image_url);

          if (!album.image_url || album.image_url === 'no') {
            console.log('Fetching cover for:', album.artist, album.title);
            const fetchedImageUrl = await fetchAlbumCoverWithFallbacks(album.artist, album.title, album.id);
          
            const imageStatus = fetchedImageUrl ? fetchedImageUrl : 'no';
          
            console.log(`Fetched image result for ${album.artist} - ${album.title}: ${imageStatus}`);
          
            const { error: updateError } = await supabase
              .from('collection')
              .update({ image_url: imageStatus })
              .eq('id', album.id);
          
            if (updateError) {
              console.error('Failed to update image_url in Supabase for', album.artist, album.title, updateError);
            } else {
              console.log(`Successfully updated Supabase: ${album.artist} - ${album.title} ➔ ${imageStatus}`);
            }
          }

          return updatedAlbum;
        })
      );
    
      setAlbums(albumsWithImages);
      setFilteredAlbums(albumsWithImages);
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
  const renderSidesAndTracks = (album) => (
    <div className="sides-listing" style={{ marginTop: '8px', fontSize: '0.8rem', textAlign: 'center' }}>
      {Object.entries(album.sides).map(([sideName, tracks]) => (
        <div key={sideName} style={{ marginBottom: '4px' }}>
          <strong>Side {sideName}</strong>
          <ul style={{ listStyleType: 'none', padding: 0, margin: '4px 0' }}>
            {tracks.map((track, index) => (
              <li key={index}>{track}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="browse-albums">
{/* Header removed for full-page version */}


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
            ) : null}
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
            <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '0.9rem' }}>
              {album.artist} – {album.title}
            </div>
            {album.sides && renderSidesAndTracks(album)}

            {expandedId === album.id && (
              <div
                className="request-form"
                onClick={(e) => e.stopPropagation()}
              >
                  {/* Display sides and tracks if available */}
                  {album.sides && renderSidesAndTracks(album)}

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
