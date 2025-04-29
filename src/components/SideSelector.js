// src/components/SideSelector.js
import React from 'react';

const SideSelector = ({ sides, selectedSide, onSelectSide }) => {
  return (
    <div className="side-selector">
      <h3>Select Side:</h3>
      <div className="side-tabs">
        {sides.map((side) => (
          <button
            key={side}
            className={`side-tab ${selectedSide === side ? 'active' : ''}`}
            onClick={() => onSelectSide(side)}
          >
            Side {side}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideSelector;