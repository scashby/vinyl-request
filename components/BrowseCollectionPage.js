// In BrowseCollectionPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BrowseAlbums from './BrowseAlbums';
import { supabase } from '../supabaseClient';
import { handleAlbumRequest } from '../utils/requestUtils';

const BrowseCollectionPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [expandedId, setExpandedId] = useState(null);
  const [side, setSide] = useState('A');
  const [name, setName] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async (album) => {
    if (!side || !eventId) return;

    const onSuccess = (message, data, wasUpdated) => {
      setStatusMessage({
        type: 'success',
        text: message
      });
      setExpandedId(null);
      setName('');
      setSide('A');
      
      // Optional: Add a timeout to clear the status message
      setTimeout(() => setStatusMessage(null), 3000);
    };
    
    const onError = (message) => {
      setStatusMessage({
        type: 'error',
        text: message
      });
      
      // Optional: Add a timeout to clear the error message
      setTimeout(() => setStatusMessage(null), 3000);
    };
    
    await handleAlbumRequest({
      album,
      side,
      name,
      eventId: parseInt(eventId, 10),
      onSuccess,
      onError
    });
  };

  return (
    <div className="browse-albums">
      <div className="browse-header">
        <h2>Browse Our Collection</h2>
        <button onClick={() => navigate(-1)}>⬅ Return to Event</button>
      </div>
      
      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      <BrowseAlbums
        activeEventId={eventId}
        handleSubmit={handleSubmit}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        side={side}
        setSide={setSide}
        name={name}
        setName={setName}
      />
    </div>
  );
};

export default BrowseCollectionPage;