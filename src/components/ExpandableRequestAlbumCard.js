// ✅ Imports
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import TrackList from './components/TrackList';
import '../css//expandableRequestAlbumCard.css';

// ✅ ExpandableRequestAlbumCard component
const ExpandableRequestAlbumCard = ({ 
  album, 
  onClose,
  selectedSide
}) => {
  const [sidesData, setSidesData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch side data if not already present in the album object
  useEffect(() => {
    const fetchSideData = async () => {
      // If sides data already exists in the album object, use it
      if (album.sides && Object.keys(album.sides).length > 0) {
        setSidesData(album.sides);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // If no sides data, attempt to fetch from external APIs
        const { fetchAlbumData } = await import('api/albumEnrichment');
        const enrichedData = await fetchAlbumData(album);
        
        if (enrichedData && enrichedData.sides) {
          setSidesData(enrichedData.sides);
          
          // Optionally save the enriched data back to Supabase
          await supabase
            .from('collection')
            .update({ sides: enrichedData.sides })
            .eq('id', album.id);
        } else {
          // If no data found, create a placeholder with empty sides A-F
          const placeholderSides = {};
          ['A', 'B', 'C', 'D', 'E', 'F'].forEach(side => {
            placeholderSides[side] = { tracks: [] };
          });
          setSidesData(placeholderSides);
        }
      } catch (err) {
        setError('Failed to load side information');
        console.error('Error fetching side data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSideData();
  }, [album]);

  // ✅ Render component
  return (
    <div className="expanded-album-card">
      <div className="expanded-card-header">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{album.artist} - {album.title}</h2>
        <p>{album.year} • {album.format} • {album.folder}</p>
      </div>

      <div className="expanded-card-content">
        <div className="album-image">
          {album.image_url && album.image_url !== 'no' ? (
            <img 
              src={album.image_url} 
              alt={`${album.artist} - ${album.title}`}
            />
          ) : (
            <div className="album-placeholder">
              {album.artist} - {album.title}
            </div>
          )}
        </div>

        <div className="album-details">
          {isLoading ? (
            <div className="loading-indicator">Loading album details...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : sidesData ? (
            <>
              {/* Just the side button without any heading */}
              <div className="side-indicator" style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: '#1e88e5',
                color: 'white',
                borderRadius: '4px',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}>
                Side {selectedSide}
              </div>
              
              {selectedSide && (
                <TrackList 
                  tracks={sidesData[selectedSide]?.tracks || []} 
                  side={selectedSide}
                />
              )}
            </>
          ) : (
            <div className="no-data-message">
              No side information available for this album.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpandableRequestAlbumCard;