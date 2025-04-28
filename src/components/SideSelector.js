// src/components/SideSelector.js
import React from 'react';

const SideSelector = ({ sides, selectedSide, setSelectedSide }) => {
  const availableSides = Object.keys(sides);

  return (
    <div className="side-selector">
      <label htmlFor="side-dropdown">Select a Side:</label>
      <select
        id="side-dropdown"
        value={selectedSide}
        onChange={(e) => setSelectedSide(e.target.value)}
      >
        <option value="">-- Choose a Side --</option>
        {availableSides.map((side) => (
          <option key={side} value={side}>
            Side {side}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SideSelector;
