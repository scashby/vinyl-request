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
  
  // Toggle expanded state for a request
  const toggleExpand = (requestId) => {
    setExpandedId(expandedId === requestId ? null : requestId);
  };

  return (
    <section className="request-queue">
      <h3>📻 Request Queue</h3>

      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <div className="album-grid">
          {requests.map((request) => (
            <div key={request.id} className="request-item">
              <div 
                className="album-card" 
                onClick={() => toggleExpand(request.id)}
              >
                <div className="album-image-container">
                  {request.image_url && request.image_url !== 'no' ? (
                    <img
                      src={request.image_url}
                      alt={`${request.artist} - ${request.title}`}
                      className="album-cover"
                    />
                  ) : (
                    <div className="album-placeholder">
                      {request.artist} - {request.title}
                    </div>
                  )}
                </div>
                
                <div className="album-info-text">
                  <div className="album-title">{request.artist} - {request.title}</div>
                  <div className="side-text">Side {request.side}</div>
                </div>
                
                <div className="request-meta">
                  <div className="requested-by">
                    Requested by {formatRequesters(request.name)}
                  </div>
                  <div className="votes-container">
                    <span className="votes-count">{request.votes} votes</span>
                    {!adminMode && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          voteRequest(request.id, 1);
                        }} 
                        className="upvote-btn"
                        title="Give this a like"
                      >
                        👍
                      </button>
                    )}
                    <span className="vote-prompt">Click the thumbs up to give it a like</span>
                  </div>
                </div>

                {adminMode && (
                  <div className="admin-actions" onClick={e => e.stopPropagation()}>
                    <button onClick={() => markNowPlaying(request.id)} className="admin-btn">▶️</button>
                    <button onClick={() => markPlayed(request.id)} className="admin-btn">✅</button>
                    <button onClick={() => deleteRequest(request.id)} className="admin-btn">🗑</button>
                  </div>
                )}
              </div>
              
              {expandedId === request.id && (
                <div className="expanded-album-details">
                  <div className="expanded-header">
                    <h3>{request.artist} - {request.title}</h3>
                    <button 
                      className="close-button" 
                      onClick={() => setExpandedId(null)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="expanded-content">
                    <div className="album-details-left">
                      {request.image_url && request.image_url !== 'no' ? (
                        <img
                          src={request.image_url}
                          alt={`${request.artist} - ${request.title}`}
                          className="expanded-album-cover"
                        />
                      ) : (
                        <div className="expanded-album-placeholder">
                          {request.artist} - {request.title}
                        </div>
                      )}
                      
                      <div className="album-metadata">
                        <p>
                          {request.year && `${request.year} • `}
                          {request.format && `${request.format} • `}
                          {request.folder || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="album-details-right">
                      <div className="side-selector">
                        <h4>Requested Side: {request.side}</h4>
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
                          No track information available for Side {request.side}.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Now Playing and Up Next can be displayed separately above the grid */}
      {nowPlaying && (
        <div className="now-playing-container">
          <h4>▶️ Now Playing</h4>
          <div className="now-playing-content">
            <div className="album-image-container">
              {nowPlaying.image_url && nowPlaying.image_url !== 'no' ? (
                <img
                  src={nowPlaying.image_url}
                  alt={`${nowPlaying.artist} - ${nowPlaying.title}`}
                  className="album-cover"
                />
              ) : (
                <div className="album-placeholder">
                  {nowPlaying.artist} - {nowPlaying.title}
                </div>
              )}
            </div>
            <div className="now-playing-info">
              <strong>{nowPlaying.artist}</strong> - {nowPlaying.title} (Side {nowPlaying.side})
              <div className="requester-info">
                Requested by {formatRequesters(nowPlaying.name)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {upNext && (
        <div className="up-next-container">
          <h4>⏭ Up Next</h4>
          <div className="up-next-content">
            <div className="album-image-container">
              {upNext.image_url && upNext.image_url !== 'no' ? (
                <img
                  src={upNext.image_url}
                  alt={`${upNext.artist} - ${upNext.title}`}
                  className="album-cover"
                />
              ) : (
                <div className="album-placeholder">
                  {upNext.artist} - {upNext.title}
                </div>
              )}
            </div>
            <div className="up-next-info">
              <strong>{upNext.artist}</strong> - {upNext.title} (Side {upNext.side})
              <div className="requester-info">
                Requested by {formatRequesters(upNext.name)}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RequestQueue;