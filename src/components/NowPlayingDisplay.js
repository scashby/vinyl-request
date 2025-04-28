import React from 'react';
import '../css/NowPlayingDisplay.css';

const NowPlayingDisplay = ({ nowPlaying }) => {
  if (!nowPlaying) return <div className="now-playing-display">🎶 Nothing playing right now</div>;

  return (
    <div className="now-playing-display">
      <h2>🎶 Now Playing</h2>
      <div>
        <strong>{nowPlaying.artist}</strong><br />
        <em>{nowPlaying.title}</em><br />
        <span>Side {nowPlaying.side}</span>
      </div>
    </div>
  );
};

export default NowPlayingDisplay;
