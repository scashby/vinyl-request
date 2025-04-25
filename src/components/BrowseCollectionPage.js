import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BrowseAlbums from './BrowseAlbums';

const BrowseCollectionPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [expandedId, setExpandedId] = useState(null);
  const [side, setSide] = useState('A');
  const [name, setName] = useState('');

  const handleSubmit = async (album) => {
    if (!side || !eventId) return;

    const newRequest = {
      album_id: parseInt(album.id, 10),
      event_id: parseInt(eventId, 10),
      side,
      name: name || 'Anonymous',
      votes: 1,
      artist: album.artist,
      title: album.title,
      status: 'pending',
      folder: album.folder || 'Unknown',
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('requests').insert([newRequest]);

    if (error) {
      console.error('❌ Insert failed:', error);
    } else {
      console.log('✅ Insert succeeded:', data);
    }

    setExpandedId(null);
    setName('');
    setSide('A');
  };

  return (
    <div className="browse-albums">
      <div className="browse-header">
        <h2>Browse Our Collection</h2>
        <button onClick={() => navigate(-1)}>⬅ Return to Event</button>
      </div>

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
