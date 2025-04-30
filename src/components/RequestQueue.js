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
  
  // Handle click on a request to expand it
  const handleRequestClick = (requestId) => {
    setExpandedId(expandedId === requestId ? null : requestId);
  };

  return (
    <section className="request-queue">
      <h3>📻 Request Queue</h3>

      {/* Now Playing Display - Unchanged */}
      {nowPlaying && (
        <div className="now-playing">
          <h4>▶️ Now Playing</h4>
          <strong>{nowPlaying.artist}</strong> — {nowPlaying.title} (Side {nowPlaying.side})<br />
          <small>Requested by {nowPlaying.name}</small>
        </div>
      )}

      {/* Up Next Display - Unchanged */}
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
        <ul className="queue-list">
          {requests.map((request) => (
            <li key={request.id} className="queue-item">
              <div className="queue-item-content">
                {/* Album image/cover */}
                <div className="album-image-container">
                  {request.image_url && request.image_url !== 'no' ? (
                    <img
                      src={request.image_url}
                      alt={`${request.artist} - ${request.title}`}
                      className="album-cover"
                    />
                  ) : (
                    <div className="album-placeholder">
                      {request.artist} – {request.title}
                    </div>
                  )}
                  <div className="album-info">
                    {request.artist} – {request.title}
                  </div>
                  <div className="side-info">Side {request.side}</div>
                </div>
                
                {/* Request details */}
                <div className="request-details">
                  <div>Requested by {formatRequesters(request.name)}</div>
                  <div className="votes-section">
                    <span className="vote-count">{request.votes} votes</span>
                    {!adminMode && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          voteRequest(request.id, 1);
                        }}
                        className="vote-button"
                        title="Click to upvote"
                      >
                        👍
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Show album details button */}
                <div className="album-expand">
                  <button 
                    className="expand-button"
                    onClick={() => handleRequestClick(request.id)}
                  >
                    {expandedId === request.id ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                
                {/* Admin controls if needed */}
                {adminMode && (
                  <div className="admin-controls">
                    <button onClick={() => markNowPlaying(request.id)}>▶️</button>
                    <button onClick={() => markPlayed(request.id)}>✅</button>
                    <button onClick={() => deleteRequest(request.id)}>🗑</button>
                  </div>
                )}
              </div>
              
              {/* Expanded album details */}
              {expandedId === request.id && (
                <div className="expanded-album-details">
                  <div className="expanded-album-card">
                    <div className="expanded-card-header">
                      <h2>{request.artist} - {request.title}</h2>
                      <button className="close-button" onClick={() => setExpandedId(null)}>×</button>
                    </div>
                    <div className="expanded-card-content">
                      <div className="album-image">
                        {request.image_url && request.image_url !== 'no' ? (
                          <img 
                            src={request.image_url} 
                            alt={`${request.artist} - ${request.title}`}
                          />
                        ) : (
                          <div className="album-placeholder">
                            {request.artist} - {request.title}
                          </div>
                        )}
                      </div>
                      <div className="album-details">
                        <p>{request.year} • {request.format} • {request.folder}</p>
                        
                        <div className="side-selector">
                          <h4>Side {request.side}</h4>
                        </div>
                        
                        {request.tracks && request.tracks.length > 0 ? (
                          <div className="track-list">
                            <h4>Tracks:</h4>
                            <ol>
                              {request.tracks.map((track, idx) => (
                                <li key={idx}>{track}</li>
                              ))}
                            </ol>
                          </div>
                        ) : (
                          <div className="no-tracks-message">
                            No tracks available for Side {request.side}.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RequestQueue;