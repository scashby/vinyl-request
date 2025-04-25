import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import 'css/Header.css';
import logo from '../assets/devils-purse-logo.png';

const Header = ({ session, setSession, setAdminMode }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://vinyl-request.vercel.app/admin' // or http://localhost:3000/admin for local dev
      }
    });
    if (error) console.error('Google login failed:', error.message);
  };

  /*const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAdminMode(false);
  };
  */

  return (
    <header className="app-header">
      <div className="header-column logo-column">
        <img src={logo} alt="Devil's Purse Logo" className="dp-logo" />
      </div>

      <div className="header-column title-column">
        <h1 className="app-title">
          Devil's Purse BYO Vinyl
          <br />
          (and Cassettes) Request Queue
        </h1>
      </div>

      <div className="header-column gear-column">
        <div
          className="gear-button"
          onClick={() => {
            if (session) {
              window.location.href = "/admin";
            } else {
              setShowAdminLogin(!showAdminLogin);
            }
          }}
          title="Admin Panel"
            >
          ⚙️
        </div>
        {showAdminLogin && !session && (
          <div className="admin-login-panel">
            <button onClick={handleLogin}>Sign in with Google</button>
          </div>
        )}
      </div>

    </header>
  );
};

export default Header;
