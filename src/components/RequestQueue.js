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
  const [expandedRequest, setExpandedRequest] = useState(null);

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
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  return (
    <section className="request-queue">
      <h3>📻 Request Queue</h3>

      {nowPlaying && (
        <div className="now-playing request-card">
          <div className="request-card-header">
            <h4>▶️ Now Playing</h4>
          </div>
          <div className="request-card-content">
            <div className="album-image">
              {nowPlaying.image_url && nowPlaying.image_url !== 'no' ? (
                <img 
                  src={nowPlaying.image_url} 
                  alt={`${nowPlaying.artist} - ${nowPlaying.title}`}
                />
              ) : (
                <div className="album-placeholder">
                  {nowPlaying.artist.substring(0, 1)}{nowPlaying.title.substring(0, 1)}
                </div>
              )}
            </div>
            <div className="request-details">
              <div className="request-title">
                <strong>{nowPlaying.artist}</strong>
                <span className="separator">—</span>
                <span>{nowPlaying.title}</span>
                <span className="side-label">Side {nowPlaying.side}</span>
              </div>
              <div className="request-meta">
                <small>Requested by {formatRequesters(nowPlaying.name)}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {upNext && (
        <div className="up-next request-card">
          <div className="request-card-header">
            <h4>⏭ Up Next</h4>
          </div>
          <div className="request-card-content">
            <div className="album-image">
              {upNext.image_url && upNext.image_url !== 'no' ? (
                <img 
                  src={upNext.image_url} 
                  alt={`${upNext.artist} - ${upNext.title}`}
                />
              ) : (
                <div className="album-placeholder">
                  {upNext.artist.substring(0, 1)}{upNext.title.substring(0, 1)}
                </div>
              )}
            </div>
            <div className="request-details">
              <div className="request-title">
                <strong>{upNext.artist}</strong>
                <span className="separator">—</span>
                <span>{upNext.title}</span>
                <span className="side-label">Side {upNext.side}</span>
              </div>
              <div className="request-meta">
                <small>Requested by {formatRequesters(upNext.name)}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <ul className="queue-list">
          {requests.map((req) => (
            <li 
              key={req.id} 
              className={`queue-item ${req.status} ${expandedRequest === req.id ? 'expanded' : ''}`}
              onClick={() => toggleExpand(req.id)}
            >
              <div className="request-card-content">
                <div className="album-image">
                  {req.image_url && req.image_url !== 'no' ? (
                    <img 
                      src={req.image_url} 
                      alt={`${req.artist} - ${req.title}`}
                    />
                  ) : (
                    <div className="album-placeholder">
                      {req.artist.substring(0, 1)}{req.title.substring(0, 1)}
                    </div>
                  )}
                </div>
                <div className="request-details">
                  <div className="request-title">
                    <strong>{req.artist}</strong>
                    <span className="separator">—</span>
                    <span>{req.title}</span>
                    <span className="side-label">Side {req.side}</span>
                  </div>
                  <div className="request-meta">
                    <small>Requested by {formatRequesters(req.name)}</small>
                    <span className="vote-count">
                      <span className="votes-number">{req.votes}</span>
                      <span className="votes-label">votes</span>
                    </span>
                  </div>
                </div>
                
                <div className="request-actions" onClick={(e) => e.stopPropagation()}>
                  {adminMode ? (
                    <div className="admin-buttons">
                      <button onClick={() => markNowPlaying(req.id)} className="action-btn play-btn">▶️</button>
                      <button onClick={() => markPlayed(req.id)} className="action-btn done-btn">✅</button>
                      <button onClick={() => deleteRequest(req.id)} className="action-btn delete-btn">🗑</button>
                    </div>
                  ) : (
                    <div className="vote-buttons">
                      <button onClick={() => voteRequest(req.id, 1)} className="action-btn upvote-btn">👍</button>
                    </div>
                  )}
                </div>
              </div>
              
              {expandedRequest === req.id && (
                <div className="expanded-content">
                  <div className="expanded-details">
                    <div className="expanded-info">
                      <p><strong>Format:</strong> {req.format || 'Unknown'}</p>
                      <p><strong>Year:</strong> {req.year || 'Unknown'}</p>
                    </div>
                    {req.tracks && req.tracks.length > 0 && (
                      <div className="expanded-tracks">
                        <h5>Side {req.side} Tracks:</h5>
                        <ol>
                          {req.tracks.map((track, idx) => (
                            <li key={idx}>{track}</li>
                          ))}
                        </ol>
                      </div>
                    )}
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