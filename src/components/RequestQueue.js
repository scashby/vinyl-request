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
  const handleRequestClick = (requestId) => {
    setExpandedId(requestId === expandedId ? null : requestId);
  };

  return (
    <section className="request-queue">
      <h3>📻 Request Queue</h3>

      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <div className="album-grid">
          {requests.map((request) => (
            <div
              key={request.id}
              className={`album-card ${expandedId === request.id ? 'expanded' : ''}`}
              onClick={() => handleRequestClick(request.id)}
            >
              {/* Album image/placeholder - same as BrowseAlbums */}
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
                  />
                ) : (
                  <div
                    className="album-placeholder"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'black',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '5px',
                      fontSize: '0.9em',
                    }}
                  >
                    {request.artist} – {request.title}
                  </div>
                )}
              </div>

              {/* Album info text - same as BrowseAlbums */}
              <div
                className="album-info-text"
                style={{ marginTop: '5px', textAlign: 'center', fontSize: '0.85em' }}
              >
                {request.artist} – {request.title}
              </div>
              
              {/* Side label */}
              <div className="side-label" style={{ textAlign: 'center', fontSize: '0.8em', color: '#666' }}>
                Side {request.side}
              </div>

              {/* Request info - new for RequestQueue */}
              <div className="request-info" style={{ marginTop: '8px', padding: '0 5px' }}>
                <div className="requested-by" style={{ fontSize: '0.85em' }}>
                  Requested by {formatRequesters(request.name)}
                </div>
                
                <div className="votes-container" style={{ 
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

              {/* Admin controls if needed */}
              {adminMode && (
                <div className="admin-actions" style={{ 
                  marginTop: '10px', 
                  display: 'flex', 
                  justifyContent: 'space-around' 
                }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); markNowPlaying(request.id); }} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ▶️
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); markPlayed(request.id); }} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ✅
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteRequest(request.id); }} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    🗑
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Now Playing Display */}
      {nowPlaying && (
        <div className="now-playing-section" style={{ marginTop: '20px', padding: '10px', borderLeft: '4px solid #4CAF50' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>▶️ Now Playing</h4>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', marginRight: '15px', flexShrink: 0 }}>
              {nowPlaying.image_url && nowPlaying.image_url !== 'no' ? (
                <img
                  src={nowPlaying.image_url}
                  alt={`${nowPlaying.artist} - ${nowPlaying.title}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: 'black',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8em',
                }}>
                  {nowPlaying.artist.substring(0, 1)}{nowPlaying.title.substring(0, 1)}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>
                {nowPlaying.artist} – {nowPlaying.title} (Side {nowPlaying.side})
              </div>
              <div style={{ fontSize: '0.9em', color: '#666', marginTop: '3px' }}>
                Requested by {formatRequesters(nowPlaying.name)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Up Next Display */}
      {upNext && (
        <div className="up-next-section" style={{ marginTop: '15px', padding: '10px', borderLeft: '4px solid #2196F3' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>⏭ Up Next</h4>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', marginRight: '15px', flexShrink: 0 }}>
              {upNext.image_url && upNext.image_url !== 'no' ? (
                <img
                  src={upNext.image_url}
                  alt={`${upNext.artist} - ${upNext.title}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: 'black',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8em',
                }}>
                  {upNext.artist.substring(0, 1)}{upNext.title.substring(0, 1)}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>
                {upNext.artist} – {upNext.title} (Side {upNext.side})
              </div>
              <div style={{ fontSize: '0.9em', color: '#666', marginTop: '3px' }}>
                Requested by {formatRequesters(upNext.name)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expandable details would go here - similar to ExpandableAlbumCard
         but without the request form */}
      {expandedId && (
        <div className="expanded-album-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div className="expanded-album-card" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '90%',
            width: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h2>{requests.find(r => r.id === expandedId)?.artist} - {requests.find(r => r.id === expandedId)?.title}</h2>
              <button 
                onClick={() => setExpandedId(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                {/* Album image */}
                {(() => {
                  const album = requests.find(r => r.id === expandedId);
                  return album?.image_url && album.image_url !== 'no' ? (
                    <img 
                      src={album.image_url} 
                      alt={`${album.artist} - ${album.title}`}
                      style={{ width: '100%', maxWidth: '300px' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      maxWidth: '300px',
                      aspectRatio: '1/1',
                      backgroundColor: 'black',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: '20px',
                    }}>
                      {album?.artist} - {album?.title}
                    </div>
                  );
                })()}
                
                <p style={{ marginTop: '10px', color: '#666' }}>
                  {(() => {
                    const album = requests.find(r => r.id === expandedId);
                    return `${album?.year || ''} ${album?.year ? '•' : ''} ${album?.format || ''} ${album?.format ? '•' : ''} ${album?.folder || 'Unknown'}`;
                  })()}
                </p>
              </div>
              
              <div style={{ flex: 1.5 }}>
                <h3>Requested Side: {requests.find(r => r.id === expandedId)?.side}</h3>
                
                <div style={{ marginTop: '20px' }}>
                  <h4>Tracks:</h4>
                  {(() => {
                    const album = requests.find(r => r.id === expandedId);
                    if (album?.tracks && album.tracks.length > 0) {
                      return (
                        <ol style={{ paddingLeft: '20px' }}>
                          {album.tracks.map((track, index) => (
                            <li key={index}>{track}</li>
                          ))}
                        </ol>
                      );
                    } else {
                      return <p>No tracks available for Side {album?.side}.</p>;
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RequestQueue;