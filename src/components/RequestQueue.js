import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
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
  // State to store album data from Supabase
  const [albumData, setAlbumData] = useState({});
  // Testing state to track image loading success
  const [imageLoadStatus, setImageLoadStatus] = useState({});

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

  // ✅ Fetch album artwork from Supabase for all requests
  useEffect(() => {
    const fetchAlbumData = async () => {
      if (!requests || requests.length === 0) return;
      
      console.log('TEST: Fetching album data for', requests.length, 'requests');
      
      // Fetch all albums from collection table
      const { data, error } = await supabase
        .from('collection')
        .select('id, artist, title, image_url, year, format, folder');
      
      if (error) {
        console.error('TEST: Error fetching album data from Supabase:', error);
        return;
      }
      
      console.log('TEST: Fetched', data.length, 'albums from Supabase collection');
      
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
          console.log(`TEST: Found match for request ${request.id}:`, {
            requestArtist: request.artist,
            requestTitle: request.title,
            matchedAlbumId: match.id,
            hasImageUrl: !!match.image_url
          });
        } else {
          console.log(`TEST: No match found for request ${request.id}:`, {
            requestArtist: request.artist,
            requestTitle: request.title
          });
        }
      });
      
      setAlbumData(albumMatches);
    };
    
    fetchAlbumData();
  }, [requests]);

  // Track image loading success/failure
  const handleImageLoad = (requestId) => {
    console.log(`TEST: Image loaded successfully for request ${requestId}`);
    setImageLoadStatus(prev => ({
      ...prev,
      [requestId]: { loaded: true, error: false }
    }));
  };

  const handleImageError = (requestId, artist, title) => {
    console.error(`TEST: Image load failed for request ${requestId}:`, artist, title);
    setImageLoadStatus(prev => ({
      ...prev,
      [requestId]: { loaded: false, error: true }
    }));
  };

  return (
    <section className="request-queue">
      <h3>📻 Request Queue</h3>
      
      {/* Testing info section */}
      <div className="test-info" style={{ 
        padding: '10px', 
        margin: '10px 0', 
        backgroundColor: '#f0f0f0', 
        border: '1px solid #ddd' 
      }}>
        <h4>Album Artwork Test Results</h4>
        <p>Requests processed: {requests.length}</p>
        <p>Albums matched from Supabase: {Object.keys(albumData).length}</p>
        <ul>
          {requests.map(req => (
            <li key={req.id}>
              {req.artist} - {req.title}: 
              {albumData[req.id] ? 
                ` ✅ Found (ID: ${albumData[req.id].id})` : 
                ` ❌ Not found in collection`
              }
              {imageLoadStatus[req.id]?.loaded && ' - Image loaded successfully'}
              {imageLoadStatus[req.id]?.error && ' - Image failed to load'}
            </li>
          ))}
        </ul>
      </div>

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
              <div key={request.id} className="request-row">
                <div className="request-album" onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}>
                  {/* Album image */}
                  <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                    {/* Display status indicator for testing */}
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      background: album ? 'green' : 'red', 
                      color: 'white', 
                      padding: '2px 5px', 
                      fontSize: '10px',
                      zIndex: 10
                    }}>
                      {album ? '✓ From Supabase' : '✗ No Match'}
                    </div>
                    
                    {imageUrl && imageUrl !== 'no' ? (
                      <img
                        src={imageUrl}
                        alt={`${request.artist} - ${request.title}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onLoad={() => handleImageLoad(request.id)}
                        onError={(e) => {
                          handleImageError(request.id, request.artist, request.title);
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
                      {album?.year && `${album.year} • `}
                      {album?.format && `${album.format} • `}
                      {album?.folder || request.folder || 'Unknown'}
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
            );
          })}
        </div>
      )}
    </section>
  );
};

export default RequestQueue;