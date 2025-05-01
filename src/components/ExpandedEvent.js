// src/components/ExpandedEvent.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import RequestQueue from './RequestQueue';
import BrowseAlbums from './BrowseAlbums';
import NowPlayingDisplay from './NowPlayingDisplay';
import UpNextDisplay from './UpNextDisplay';
import '../css/EventDisplay.css';
import { useNavigate } from 'react-router-dom';
import { handleAlbumRequest } from '../utils/requestUtils';

export default function ExpandedEvent({ event, onBack }) {
  const [requests, setRequests] = useState([]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [side, setSide] = useState('A');
  const [name, setName] = useState('');
  const [nowPlaying, setNowPlaying] = useState(null);
  const [upNext, setUpNext] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRequests() {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('event_id', event.id)
        .order('votes', { ascending: false });
      if (!error && data) {
        setRequests(data);

        if (data.length > 0) {
          setNowPlaying(data[0]);
          setUpNext(data[1] || null);
        }
      }
    }

    fetchRequests();
  }, [event.id]);

  const handleSubmit = async (album) => {
    const eventId = event?.id;
    
    const onSuccess = (message, data, wasUpdated) => {
      // Update the local requests state
      if (wasUpdated) {
        setRequests(prev =>
          prev.map(r =>
            r.id === data[0].id
              ? data[0]
              : r
          )
        );
      } else {
        setRequests(prev => [...prev, data[0]]);
      }
      
      setExpandedId(null);
      setName('');
      setSide('A');
    };
    
    const onError = (message) => {
      console.error(message);
      // Optionally show error message to user
    };
    
    await handleAlbumRequest({
      album,
      side,
      name,
      eventId,
      onSuccess,
      onError,
      skipParentCallback: true // Prevent any duplicate processing
    });
  };

  const voteRequest = async (requestId, delta) => {
    const { data: current, error: fetchError } = await supabase
      .from('requests')
      .select('votes')
      .eq('id', requestId)
      .single();

    if (fetchError || !current) {
      console.error('Failed to fetch current vote count:', fetchError);
      return;
    }

    const newVotes = current.votes + delta;

    const { data: updated, error: updateError } = await supabase
      .from('requests')
      .update({ votes: newVotes })
      .eq('id', requestId)
      .select();

    if (updateError) {
      console.error('Vote update failed:', updateError);
    } else {
      console.log('Vote updated:', updated);
      setRequests(prev =>
        prev.map(r =>
          r.id === requestId
            ? { ...r, votes: newVotes }
            : r
        )
      );
    }
  };

  const isToday = new Date(event.date).toDateString() === new Date().toDateString();

  return (
    <div className="expanded-event-view">
      <button onClick={onBack} className="back-button">← Back to Events</button>

      <h2>{event.title}</h2>
      <p><strong>{new Date(event.date).toLocaleDateString('en-US')}</strong> — {event.time}</p>
      {event.info && <p>{event.info}</p>}

      {isToday && nowPlaying && (
        <>
          <NowPlayingDisplay nowPlaying={nowPlaying} />
          {upNext && <UpNextDisplay upNext={upNext} />}
        </>
      )}
      <button onClick={() => navigate(`/browse/${event.id}`)} className="browse-button">
        🎧 Browse the collection and add your pick
      </button>
      
      <RequestQueue
        requests={requests}
        setRequests={setRequests}
        voteRequest={voteRequest}
      />

      <button onClick={() => navigate(`/browse/${event.id}`)} className="browse-button">
        🎧 Browse the collection and add your pick
      </button>


      {showBrowser && (
        <BrowseAlbums
          session={null}
          activeEventId={event.id}
          handleSubmit={handleSubmit}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          side={side}
          setSide={setSide}
          name={name}
          setName={setName}
          hideFilterBar={true} // ✅ Hides filter bar on this page
        />
      )}
    </div>
  );
}
