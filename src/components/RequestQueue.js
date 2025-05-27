import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/RequestQueue.css';
import ExpandableRequestAlbumCard from './ExpandableRequestAlbumCard';

const RequestQueue = ({
  requests = [],
  nowPlaying,
  upNext,
  adminMode,
  markNowPlaying,
  markPlayed,
  deleteRequest,
  voteRequest
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [albumData, setAlbumData] = useState({});

  // Helper function to format requesters names
  const formatRequesters = (name) => {
    if (!name) return "Anonymous";
    
    const requesters = name.split(',').map(n => n.trim());
    if (requesters.length <= 3) {
      return name;
    } else {
      return `${requesters[0]} and ${requesters.length - 1} others`;
    }
  };

  // Fetch album data from Supabase
  useEffect(() => {
    const fetchAlbumData = async () => {
      if (!requests || requests.length === 0) return;
      
      // Fetch all albums from collection table
      const { data, error } = await supabase
        .from('collection')
        .select('id, artist, title, image_url, year, format, folder');
      
      if (error) {
        console.error('Error fetching album data from Supabase:', error);
        return;
      }
      
      // Match each request to its corresponding album in collection
      const albumMatches = {};
      
      requests.forEach(request => {
        // Find matching album by artist and title (case insensitive)
        const match = data.find(
          album => 
            album.artist?.toLowerCase() === request.artist?.toLowerCase() && 
            album.title?.toLowerCase() === request.title?.toLowerCase()
        );
        
        if (match) {
          albumMatches[request.id] = match;
        }
      });
      
      setAlbumData(albumMatches);
    };
    
    fetchAlbumData();
  }, [requests]);

  // Handle album click to expand
  const handleAlbumClick = (requestId) => {
    setExpandedId(requestId === expandedId ? null : requestId);
  };

  // Handle close of expanded album card
  const handleCloseExpandedCard = () => {
    setExpandedId(null);
  };

  return (
    <section className="request-queue">
      <h3>📻 Request Queue</h3>

      {/* Now Playing and Up Next sections - unchanged */}
      {nowPlaying && (
        <div className="now-playing">
          <h4>▶️ Now Playing</h4>
          <strong>{nowPlaying.artist}</strong> — {nowPlaying.title} (Side {nowPlaying.side})<br />
          <small>Requested by {nowPlaying.name}</small>
        </div>
      )}

      {upNext && (
        <div className="up-next">
          <h4>⏭ Up Next</h4>
          <strong>{upNext.artist}</strong> — {upNext.title} (Side {upNext.side})<br />
          <small>Requested by {upNext.name}</small>
        </div>
      )}

      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <div className="requests-list">
          {requests.map((request) => {
            // Get album data from our Supabase lookup
            const album = albumData[request.id];
            
            // Use image_url from Supabase if available
            const imageUrl = album?.image_url;
            
            return (
              <div 
                key={request.id} 
                className="request-row"
                onClick={() => handleAlbumClick(request.id)}
              >
                <div className="request-album">
                  {/* Album image */}
                  <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                    {imageUrl && imageUrl !== 'no' ? (
                      <img
                        src={imageUrl}
                        alt={`${request.artist} - ${request.title}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          console.error('Image load failed for:', request.artist, request.title);
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}

                    {/* Placeholder black box if no image */}
                    <div
                      className="album-placeholder"
                      style={{
                        display: (!imageUrl || imageUrl === 'no') ? 'flex' : 'none',
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
                      {request.artist} – {request.title}
                    </div>
                  </div>

                  {/* Album info under image/placeholder */}
                  <div
                    className="album-info-text"
                    style={{ marginTop: '5px', textAlign: 'center', fontSize: '0.85em' }}
                  >
                    {request.artist} – {request.title}
                  </div>
                  
                  {/* Side label */}
                  <div style={{ textAlign: 'center', fontSize: '0.8em', color: '#666' }}>
                    Side {request.side}
                  </div>
                </div>
                
                <div className="request-info">
                  <div className="requested-by">
                    Requested by {formatRequesters(request.name)}
                  </div>
                  
                  <div className="vote-section">
                    <div className="vote-count">{request.votes} votes</div>
                    
                    {!adminMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          voteRequest(request.id, 1);
                        }}
                        className="upvote-btn"
                        title="Click to upvote"
                      >
                        👍
                      </button>
                    )}
                  </div>
                </div>
                
                {adminMode && (
                  <div className="admin-controls">
                    <button onClick={(e) => { e.stopPropagation(); markNowPlaying(request.id); }}>▶️</button>
                    <button onClick={(e) => { e.stopPropagation(); markPlayed(request.id); }}>✅</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteRequest(request.id); }}>🗑</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Using ExpandableRequestAlbumCard for expanded view instead of inline expansion */}
      {expandedId && albumData[expandedId] && (
        <ExpandableRequestAlbumCard
          album={albumData[expandedId]}
          onClose={handleCloseExpandedCard}
          selectedSide={requests.find(r => r.id === expandedId)?.side}
          readOnly={true}
        />
      )}
    </section>
  );
};

export default RequestQueue;