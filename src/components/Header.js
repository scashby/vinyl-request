import React from 'react';
import 'css/Header.css';


const Header = () => (
  <header className="app-header">
    <a href="https://www.devilspurse.com" target="_blank" rel="noopener noreferrer">
      <img
        src="https://d1ynl4hb5mx7r8.cloudfront.net/wp-content/uploads/2015/06/devils-purse-300x300.png"
        alt="Devil’s Purse Logo"
        className="logo"
      />
    </a>
    <div>
      <h1>BYOVinyl (and Cassettes) at Devil’s Purse</h1>
      <h2>Request Queue</h2>
    </div>
  </header>
);

export default Header;
