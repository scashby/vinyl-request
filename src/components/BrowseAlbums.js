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
      const { data, error } = await supabase
        .from('collection')
        .select('*')
        .order('artist', { ascending: true });
    
      if (error) {
        console.error('Error fetching albums:', error);
        return;
      }
    
      const albumsWithImages = await Promise.all(
        data.map(async (album) => {
          if (album.image_url) return album;
      
          const fetchedImageUrl = await fetchAlbumCoverWithFallbacks(album.artist, album.title);
          if (fetchedImageUrl) {

            try {
              await supabase
                .from('collection')
                .update({ image_url: fetchedImageUrl })
                .eq('id', album.id);
            } catch (error) {
              console.error('Error updating image_url in Supabase:', error);
            }
            return { ...album, image_url: fetchedImageUrl };
          }
          return album;
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


            {expandedId === album.id && (
                <div className="request-form">
                  {/* Display sides and tracks if available */}
                  {album.sides && (
                    <div className="sides-listing">
                      {Object.entries(album.sides).map(([sideName, tracks]) => (
                        <div key={sideName}>
                          <strong>Side {sideName}</strong>
                          <ul>
                            {tracks.map((track, index) => (
                              <li key={index}>{track}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

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
