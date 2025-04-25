// src/components/AdminPanel.js
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import 'css/AdminPanel.css';

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
        <Outlet />
      </main>

    </div>
  );
};

export default AdminPanel;
