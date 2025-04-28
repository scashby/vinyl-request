import React from 'react';
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
  return (
    <section className="request-queue">
      <h3>📻 Request Queue</h3>

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
        <ul className="queue-list">
          {requests.map((req, index) => (
            <li key={req.id} className={`queue-item ${req.status}`}>
              <strong>{req.artist}</strong> — {req.title} (Side {req.side})
              <br />
              <small>Requested by {req.name} • Votes: {req.votes}</small>

              {adminMode && (
                <div className="admin-buttons">
                  <button onClick={() => markNowPlaying(req.id)}>▶️</button>
                  <button onClick={() => markPlayed(index)}>✅</button>
                  <button onClick={() => deleteRequest(req.id)}>🗑</button>
                </div>
              )}

              {!adminMode && (
                <div className="vote-buttons">
                  <button onClick={() => voteRequest(req.id, 1)}>⬆</button>
                  <button onClick={() => voteRequest(req.id, -1)}>⬇</button>
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
