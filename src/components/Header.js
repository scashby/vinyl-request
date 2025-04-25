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
    <header className="app-header">
      <div className="admin-toggle" onClick={() => setShowAdminLogin(!showAdminLogin)}>
        ⚙️
      </div>
      <div className="logo-title-container">
        <img src={logo} alt="Devil's Purse Logo" className="app-logo" />
        <h1 className="header-title">Devil's Purse BYO Vinyl (and Cassettes) Request Queue</h1>
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
