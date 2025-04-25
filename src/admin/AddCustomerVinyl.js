
import React from 'react';

const AddCustomerVinyl = () => {
  return (
    <div className="admin-section">
      <h2>Add Customer Vinyl</h2>
      <p>This placeholder is for adding manually submitted vinyl or cassette entries during events.</p>
      <ul>
        <li>Only admin-accessible, not visible to regular users.</li>
        <li>Likely need to edit: <code>CustomerVinylForm.js</code>, <code>RequestQueue.js</code>.</li>
        <li>Should include: artist, title, format (vinyl/cassette/45), side selection, notes.</li>
      </ul>
    </div>
  );
};

export default AddCustomerVinyl;
