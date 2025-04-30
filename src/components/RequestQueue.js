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
          {requests.map((request) => (
            <div key={request.id} className="request-row">
              <div className="request-album" onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}>
                {/* Album image - EXACT SAME CODE from BrowseAlbums.js */}
                <div style={{ position: 'relative', width: '100%', height: '150px' }}>
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

                  {/* Placeholder black box if no image - EXACT SAME CODE from BrowseAlbums.js */}
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

                {/* Album info under image/placeholder - EXACT SAME CODE from BrowseAlbums.js */}
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
                      onClick={() => voteRequest(request.id, 1)}
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
                  <button onClick={() => markNowPlaying(request.id)}>▶️</button>
                  <button onClick={() => markPlayed(request.id)}>✅</button>
                  <button onClick={() => deleteRequest(request.id)}>🗑</button>
                </div>
              )}
              
              {/* Expanded album details */}
              {expandedId === request.id && (
                <div className="request-expanded">
                  <h3>Album Details</h3>
                  <p>
                    {request.year && `${request.year} • `}
                    {request.format && `${request.format} • `}
                    {request.folder || 'Unknown'}
                  </p>
                  
                  <div className="side-info">
                    <h4>Side {request.side}</h4>
                    {request.tracks && request.tracks.length > 0 ? (
                      <ol className="track-list">
                        {request.tracks.map((track, idx) => (
                          <li key={idx}>{track}</li>
                        ))}
                      </ol>
                    ) : (
                      <p>No tracks available for Side {request.side}.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RequestQueue;