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

  return (
    <section className="request-queue">
      <h3>📻 Request Queue</h3>

      {nowPlaying && (
        <div className="now-playing-section">
          <h4>▶️ Now Playing</h4>
          <div className="request-item playing">
            <div className="album-image-wrapper">
              {nowPlaying.image_url && nowPlaying.image_url !== 'no' ? (
                <img
                  src={nowPlaying.image_url}
                  alt={`${nowPlaying.artist} - ${nowPlaying.title}`}
                  className="album-image"
                />
              ) : (
                <div className="album-placeholder">
                  {nowPlaying.artist} - {nowPlaying.title}
                </div>
              )}
            </div>
            <div className="playing-info">
              <div><strong>{nowPlaying.artist}</strong> - {nowPlaying.title} (Side {nowPlaying.side})</div>
              <div className="requester">Requested by {formatRequesters(nowPlaying.name)}</div>
            </div>
          </div>
        </div>
      )}

      {upNext && (
        <div className="up-next-section">
          <h4>⏭ Up Next</h4>
          <div className="request-item up-next">
            <div className="album-image-wrapper">
              {upNext.image_url && upNext.image_url !== 'no' ? (
                <img
                  src={upNext.image_url}
                  alt={`${upNext.artist} - ${upNext.title}`}
                  className="album-image"
                />
              ) : (
                <div className="album-placeholder">
                  {upNext.artist} - {upNext.title}
                </div>
              )}
            </div>
            <div className="playing-info">
              <div><strong>{upNext.artist}</strong> - {upNext.title} (Side {upNext.side})</div>
              <div className="requester">Requested by {formatRequesters(upNext.name)}</div>
            </div>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <ul className="request-list">
          {requests.map((request) => (
            <li key={request.id} className="request-item">
              <div className="request-content">
                <div className="album-image-wrapper">
                  {request.image_url && request.image_url !== 'no' ? (
                    <img
                      src={request.image_url}
                      alt={`${request.artist} - ${request.title}`}
                      className="album-image"
                    />
                  ) : (
                    <div className="album-placeholder">
                      {request.artist} - {request.title}
                    </div>
                  )}
                  <div className="album-info">
                    {request.artist} - {request.title}
                  </div>
                  <div className="side-label">Side {request.side}</div>
                </div>
                
                <div className="request-details">
                  <div className="requested-by">
                    Requested by {formatRequesters(request.name)}
                  </div>
                  
                  <div className="votes-info">
                    <div className="vote-count">
                      {request.votes} votes <span className="thumbs-up">👍</span>
                    </div>
                    <div className="vote-prompt">
                      Click the thumbs up to give it a like
                    </div>
                    {!adminMode && (
                      <button 
                        onClick={() => voteRequest(request.id, 1)} 
                        className="vote-button"
                      >
                        👍
                      </button>
                    )}
                  </div>
                </div>
                
                {adminMode && (
                  <div className="admin-controls">
                    <button onClick={() => markNowPlaying(request.id)}>▶️</button>
                    <button onClick={() => markPlayed(request.id)}>✅</button>
                    <button onClick={() => deleteRequest(request.id)}>🗑</button>
                  </div>
                )}
              </div>
              
              <div 
                className="album-details-expander"
                onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
              >
                {expandedId === request.id ? 'Hide Details' : 'Show Details'}
              </div>
              
              {expandedId === request.id && (
                <div className="expanded-details">
                  <div className="album-metadata">
                    <p>
                      {request.year && `${request.year} • `}
                      {request.format && `${request.format} • `}
                      {request.folder || 'Unknown'}
                    </p>
                  </div>
                  
                  <div className="side-details">
                    <h4>Side {request.side}</h4>
                    {request.tracks && request.tracks.length > 0 ? (
                      <ol className="tracks-list">
                        {request.tracks.map((track, index) => (
                          <li key={index}>{track}</li>
                        ))}
                      </ol>
                    ) : (
                      <p>No track information available</p>
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