// src/components/TrackList.js
import React from 'react';

const TrackList = ({ tracks, side }) => {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="track-list-empty">
        <p>No tracks available for Side {side}.</p>
      </div>
    );
  }

  return (
    <div className="track-list">
      <h3>Tracks on Side {side}</h3>
      <ul>
        {tracks.map((track, index) => (
          <li key={index} className="track-item">
            <span className="track-number">{track.position || (index + 1)}</span>
            <span className="track-title">{track.title}</span>
            {track.duration && (
              <span className="track-duration">{track.duration}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrackList;