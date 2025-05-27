
import React from 'react';
import { supabase } from '../supabaseClient';

const LogoutAdmin = ({ setSession, setAdminMode }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAdminMode(false);
  };

  return (
    <div className="admin-section">
      <h2>Log Out</h2>
      <button onClick={handleLogout}>Log Out of Admin</button>
    </div>
  );
};

export default LogoutAdmin;
