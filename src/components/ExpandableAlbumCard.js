// ✅ Imports
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SideSelector from 'components/SideSelector';
import TrackList from 'components/TrackList';
import 'css/expandableAlbumCard.css';

// ✅ ExpandableAlbumCard component
const ExpandableAlbumCard = ({ 
  album, 
  currentEvent, 
  onClose,
  onSideSelect,
  selectedSide,
  onNameChange,
  name,
  onSubmit
}) => {
  const [sidesData, setSidesData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

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

  // ✅ Handle side selection
  const handleSideSelect = (side) => {
    onSideSelect(side);
  };

  // ✅ Check if the event queue is locked (24 hours before event)
  const isQueueLocked = () => {
    if (!currentEvent || !currentEvent.date) return false;
    
    const eventDate = new Date(currentEvent.date);
    const eventTime = currentEvent.time ? currentEvent.time.split(':') : ['00', '00'];
    eventDate.setHours(parseInt(eventTime[0]), parseInt(eventTime[1]), 0, 0);
    
    const lockTime = new Date(eventDate);
    lockTime.setHours(lockTime.getHours() - 24);
    
    return new Date() >= lockTime;
  };

  // ✅ Handle submit
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(album); // ✅ Let parent decide when to close
    };


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
              <SideSelector 
                sides={Object.keys(sidesData)} 
                selectedSide={selectedSide}
                onSelectSide={handleSideSelect}
              />
              
              {selectedSide && (
                <TrackList 
                  tracks={sidesData[selectedSide]?.tracks || []} 
                  side={selectedSide}
                />
              )}

              {/* ✅ Request form integrated with existing structure */}
              <div className="request-form">
                <h3>Request for {currentEvent?.title || 'Event'}</h3>
                
                {isQueueLocked() ? (
                  <div className="queue-locked-message">
                    <p>Queue is locked. Requests for this event are no longer accepted.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="name">Your name:</label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="message">Message (optional):</label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a note to your request"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={!selectedSide || !currentEvent}
                      className="request-button"
                    >
                      Request Side {selectedSide}
                    </button>
                  </form>
                )}
              </div>
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

export default ExpandableAlbumCard;