import React from 'react';
import 'css/UpNextDisplay.css';

const UpNextDisplay = ({ upNext }) => {
  if (!upNext || upNext.length === 0) return <div className="up-next-display">⏭️ Nothing queued</div>;

  return (
    <div className="up-next-display">
      <h2>⏭️ Up Next</h2>
      <ul>
        {upNext.map((track, index) => (
          <li key={index}>
            <strong>{track.artist}</strong> — <em>{track.title}</em> (Side {track.side})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpNextDisplay;
