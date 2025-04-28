// src/components/ExpandedAlbumCard.js
import React, { useState } from 'react';
import SideSelector from './SideSelector';
import TrackList from './TrackList';
import RequestForm from './RequestForm';

const ExpandedAlbumCard = ({ album, onClose, onSubmitRequest }) => {
  const [selectedSide, setSelectedSide] = useState('');
  const [userName, setUserName] = useState('');

  return (
    <div className="expanded-album-card">
      <button className="close-button" onClick={onClose}>Close</button>
      
      <img src={album.image_url} alt={`${album.artist} - ${album.title}`} className="expanded-album-cover" />
      
      <div className="expanded-album-info">
        <h2 className="artist-name">{album.artist}</h2>
        <h3 className="album-title">{album.title}</h3>
      </div>

      <SideSelector sides={album.sides} selectedSide={selectedSide} setSelectedSide={setSelectedSide} />

      {selectedSide && (
        <TrackList tracks={album.sides[selectedSide]} />
      )}

      <RequestForm
        userName={userName}
        setUserName={setUserName}
        onSubmit={() => onSubmitRequest(album, selectedSide, userName)}
        disabled={!selectedSide || !userName}
      />
    </div>
  );
};

export default ExpandedAlbumCard;
