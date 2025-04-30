import React, { useState } from 'react';
import '../css/RequestQueue.css';
import ExpandableAlbumCard from './ExpandableAlbumCard'; // Import your existing component

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

  // Handle album click to expand details
  const handleAlbumClick = (requestId) => {
    setExpandedId(requestId === expandedId ? null : requestId);
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
        <div className="requests-list">
          {requests.map((request) => (
            <div className="request-item" key={request.id}>
              <div
                className={`album-card ${expandedId === request.id ? 'expanded' : ''}`}
                onClick={() => handleAlbumClick(request.id)}
              >
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

                {/* Album info under image/placeholder */}
                <div
                  className="album-info-text"
                  style={{ marginTop: '5px', textAlign: 'center', fontSize: '0.85em' }}
                >
                  {request.artist} – {request.title}
                </div>
                
                {/* Side info */}
                <div
                  className="side-info"
                  style={{ textAlign: 'center', fontSize: '0.8em', color: '#666' }}
                >
                  Side {request.side}
                </div>
                
                {/* Request details */}
                <div className="request-info" style={{ marginTop: '8px', padding: '0 5px' }}>
                  <div className="requested-by" style={{ fontSize: '0.85em' }}>
                    Requested by {formatRequesters(request.name)}
                  </div>
                  
                  <div className="votes-section" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginTop: '5px' 
                  }}>
                    <span className="vote-count" style={{ fontWeight: 'bold' }}>
                      {request.votes} votes
                    </span>
                    
                    {!adminMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          voteRequest(request.id, 1);
                        }}
                        title="Click to upvote"
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '1.2em',
                          cursor: 'pointer',
                          padding: '2px 6px',
                        }}
                      >
                        👍
                      </button>
                    )}
                  </div>
                </div>

                {/* Admin buttons if needed */}
                {adminMode && (
                  <div className="admin-buttons" style={{ 
                    marginTop: '10px', 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        markNowPlaying(request.id); 
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      ▶️
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        markPlayed(request.id); 
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      ✅
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        deleteRequest(request.id); 
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Using your existing ExpandableAlbumCard but with modifications */}
      {expandedId && (
        <div className="expanded-album-container">
          <ExpandableAlbumCard
            album={requests.find(req => req.id === expandedId)}
            onClose={() => setExpandedId(null)}
            selectedSide={requests.find(req => req.id === expandedId)?.side}
            readOnly={true} // Add this prop to your component to hide the request form
          />
        </div>
      )}
    </section>
  );
};

export default RequestQueue;