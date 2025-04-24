// src/components/FilterBar.js
import React from 'react';
import 'css/FilterBar.css'; // ✅ Uses alias as intended

const FilterBar = ({ mediaType, setMediaType }) => {
  return (
    <div className="filter-bar">
      <button
        className={mediaType === 'all' ? 'active' : ''}
        onClick={() => setMediaType('all')}
      >
        All
      </button>
      <button
        className={mediaType === 'vinyl' ? 'active' : ''}
        onClick={() => setMediaType('vinyl')}
      >
        Vinyl
      </button>
      <button
        className={mediaType === 'cassette' ? 'active' : ''}
        onClick={() => setMediaType('cassette')}
      >
        Cassettes
      </button>
      <button
        className={mediaType === '45' ? 'active' : ''}
        onClick={() => setMediaType('45')}
      >
        45s
      </button>
    </div>
  );
};

export default FilterBar;

