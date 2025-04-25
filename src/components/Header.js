import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import 'css/Header.css';
import logo from '../assets/devils-purse-logo.png';

const Header = ({ session, setSession, setAdminMode }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Google login failed:', error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAdminMode(false);
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="Devil's Purse Logo" className="dp-logo" />
        Vinyl Request
      </div>
      <div className="gear-icon" onClick={() => setShowAdminLogin(!showAdminLogin)}>
        ⚙️
      </div>

      {showAdminLogin && (
        <div className="admin-login-panel">
          {!session ? (
            <button onClick={handleLogin}>Sign in with Google</button>
          ) : (
            <>
              <p>Logged in as {session.user.email}</p>
              <button onClick={handleLogout}>Log Out</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
