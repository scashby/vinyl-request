// src/components/AdminPanel.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import 'css/AdminPanel.css';

import EditEvents from 'admin/EditEvents';
import AddCustomerVinyl from 'admin/AddCustomerVinyl';
import EditQueue from 'admin/EditQueue';
import AddAlbumArt from 'admin/AddAlbumArt';
import AddTrackListings from 'admin/AddTrackListings';
import ReturnToHome from 'admin/ReturnToHome';
import LogoutAdmin from 'admin/LogoutAdmin';

const AdminPanel = () => {
  return (
    <div className="admin-dashboard">
      <nav className="admin-sidebar">
        <ul>
          <li><Link to="/admin/edit-events">Edit Events</Link></li>
          <li><Link to="/admin/add-customer-vinyl">Add Customer Vinyl</Link></li>
          <li><Link to="/admin/edit-queue">Edit Queue</Link></li>
          <li><Link to="/admin/replace-album-art">Add or Replace Album Art</Link></li>
          <li><Link to="/admin/replace-track-listings">Add or Replace Sides or Track Listings</Link></li>
          <li><Link to="/admin/return-home">Return to Home</Link></li>
          <li><Link to="/admin/logout">Log out of Admin</Link></li>
        </ul>
      </nav>

      <main className="admin-content">
        <Routes>
          <Route path="/admin/edit-events" element={<EditEvents />} />
          <Route path="/admin/add-customer-vinyl" element={<AddCustomerVinyl />} />
          <Route path="/admin/edit-queue" element={<EditQueue />} />
          <Route path="/admin/replace-album-art" element={<AddAlbumArt />} />
          <Route path="/admin/replace-track-listings" element={<AddTrackListings />} />
          <Route path="/admin/return-home" element={<ReturnToHome />} />
          <Route path="/admin/logout" element={<LogoutAdmin />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;
