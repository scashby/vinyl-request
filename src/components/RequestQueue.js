import React, { useState } from 'react';
import '../css/RequestQueue.css';

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
        <div className="requests-container">
          {requests.map((request) => (
            <div 
              key={request.id} 
              className="request-row"
              onClick={() => setExpandedId(request.id)}
            >
              <div className="request-album">
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  {request.image_url && request.image_url !== 'no' ? (
                    <img
                      src={request.image_url}
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
                      display: (!request.image_url || request.image_url === 'no') ? 'flex' : 'none',
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
                <div className="album-info-text">
                  {request.artist} – {request.title}
                </div>
                <div className="side-label">
                  Side {request.side}
                </div>
              </div>
              
              <div className="request-info">
                <div className="requested-by">
                  Requested by {formatRequesters(request.name)}
                </div>
                <div className="votes-container">
                  <span className="vote-count">{request.votes} votes</span>
                  {!adminMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        voteRequest(request.id, 1);
                      }}
                      className="upvote-button"
                      title="Click to upvote"
                    >
                      👍
                    </button>
                  )}
                </div>
              </div>
              
              {adminMode && (
                <div className="admin-actions">
                  <button onClick={(e) => { e.stopPropagation(); markNowPlaying(request.id); }}>▶️</button>
                  <button onClick={(e) => { e.stopPropagation(); markPlayed(request.id); }}>✅</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteRequest(request.id); }}>🗑</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Expanded Album Card */}
      {expandedId && (
        <div className="expanded-overlay">
          <div className="expanded-album-card">
            <div className="expanded-card-header">
              <h2>{requests.find(r => r.id === expandedId)?.artist} - {requests.find(r => r.id === expandedId)?.title}</h2>
              <button className="close-button" onClick={handleCloseExpandedCard}>×</button>
            </div>
            <div className="expanded-card-content">
              <div className="album-image">
                {(() => {
                  const album = requests.find(r => r.id === expandedId);
                  return album?.image_url && album.image_url !== 'no' ? (
                    <img 
                      src={album.image_url} 
                      alt={`${album.artist} - ${album.title}`}
                    />
                  ) : (
                    <div className="album-placeholder">
                      {album?.artist} - {album?.title}
                    </div>
                  );
                })()}
              </div>
              <div className="album-details">
                {(() => {
                  const album = requests.find(r => r.id === expandedId);
                  return (
                    <>
                      <p>{album?.year} • {album?.format} • {album?.folder}</p>
                      <div className="side-info">
                        <h4>Requested Side: {album?.side}</h4>
                      </div>
                      {album?.tracks && album.tracks.length > 0 ? (
                        <div className="track-list">
                          <h4>Tracks:</h4>
                          <ol>
                            {album.tracks.map((track, idx) => (
                              <li key={idx}>{track}</li>
                            ))}
                          </ol>
                        </div>
                      ) : (
                        <div className="no-tracks-message">
                          No tracks available for Side {album?.side}.
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RequestQueue;