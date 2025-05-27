
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReturnToHome = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-section">
      <h2>Return to Home</h2>
      <p>Click below to go back to the event view.</p>
      <button onClick={() => navigate('/')}>Go to Home Page</button>
    </div>
  );
};

export default ReturnToHome;
