
import React from 'react';

const AddAlbumArt = () => {
  return (
    <div className="admin-section">
      <h2>Add or Replace Album Art</h2>
      <p>This is the placeholder for uploading or overriding album cover images.</p>
      <ul>
        <li>Likely need to edit: <code>BrowseAlbums.js</code>, <code>supabaseClient.js</code>.</li>
        <li>Should support: upload, preview, delete, and default fallback override.</li>
      </ul>
    </div>
  );
};

export default AddAlbumArt;
