
import React from 'react';

const EditQueue = () => {
  return (
    <div className="admin-section">
      <h2>Edit Queue</h2>
      <p>This is the placeholder for editing the active request queue.</p>
      <ul>
        <li>Should allow marking sides as played, deleting/upvoting items, and setting Now Playing / Up Next.</li>
        <li>Likely need to edit: <code>RequestQueue.js</code>, <code>NowPlayingDisplay.js</code>, <code>UpNextDisplay.js</code>.</li>
      </ul>
    </div>
  );
};

export default EditQueue;
