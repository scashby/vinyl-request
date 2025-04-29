// src/components/FilterBar.js
import React from 'react';
import '../css/FilterBar.css'; // ✅ Uses alias as intended

const FilterBar = ({ mediaType, setMediaType }) => {
  return (
    <div className="filter-bar">
      <button
        className={mediaType === 'All' ? 'active' : ''}
        onClick={() => setMediaType('All')}
      >
        All
      </button>
      <button
        className={mediaType === 'Vinyl' ? 'active' : ''}
        onClick={() => setMediaType('Vinyl')}
      >
        Vinyl
      </button>
      <button
        className={mediaType === 'Cassette' ? 'active' : ''}
        onClick={() => setMediaType('Cassette')}
      >
        Cassettes
      </button>
      <button
        className={mediaType === '45s' ? 'active' : ''}
        onClick={() => setMediaType('45s')}
      >
        45s
      </button>
    </div>
  );
};

export default FilterBar;
