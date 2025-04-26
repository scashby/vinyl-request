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

          if (!album.image_url) {
            console.log('Fetching cover for:', album.artist, album.title);
            const fetchedImageUrl = await fetchAlbumCoverWithFallbacks(album.artist, album.title);
            updatedAlbum.image_url = fetchedImageUrl;
            console.log('Trying to update album with artist/title:', updatedAlbum.artist, updatedAlbum.title);
            const { data: updateData, error: updateError } = await supabase
            .from('collection')
            .update({ image_url: fetchedImageUrl })
            .eq('artist', album.artist)
            .eq('title', album.title);

            if (updateError) {
              console.error('Supabase update error:', updateError);
            } else {
              console.log('Supabase update successful for:', updatedAlbum.artist, updatedAlbum.title);
            }



            console.log(`Trying to update album by artist/title:`, {
              artist: album.artist,
              title: album.title,
              imageStatus: fetchedImageUrl
            });

            if (updateError) {
              console.error('Failed to update image_url status in Supabase for', album.artist, album.title, updateError);
            } else {
              console.log(`Update result from Supabase:`, updateData);
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
