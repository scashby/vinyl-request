// src/components/ExpandedEvent.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import RequestQueue from './RequestQueue';
import BrowseAlbums from './BrowseAlbums';
import NowPlayingDisplay from './NowPlayingDisplay';
import UpNextDisplay from './UpNextDisplay';
import 'css/EventDisplay.css';

export default function ExpandedEvent({ event, onBack }) {
  const [requests, setRequests] = useState([]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [side, setSide] = useState('A');
  const [name, setName] = useState('');
  const [nowPlaying, setNowPlaying] = useState(null);
  const [upNext, setUpNext] = useState(null);

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
    if (!side || !eventId) return;

    const { data: existing, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('album_id', album.id)
      .eq('event_id', eventId)
      .eq('side', side)
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking for existing request:', fetchError);
      return;
    }

    if (existing) {
      const updatedName = existing.name
        ? `${existing.name}, ${name || 'Anonymous'}`
        : (name || 'Anonymous');

      const { error: updateError } = await supabase
        .from('requests')
        .update({
          votes: existing.votes + 1,
          name: updatedName,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating vote:', updateError);
        return;
      }

      setRequests(prev =>
        prev.map(r =>
          r.id === existing.id
            ? { ...r, votes: r.votes + 1, name: updatedName }
            : r
        )
      );
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from('requests')
        .insert([{
          album_id: parseInt(album.id, 10),
          event_id: parseInt(eventId, 10),
          side,
          name: name || 'Anonymous',
          votes: 1,
          artist: album.artist,
          title: album.title,
          status: 'pending',
          folder: album.folder || 'Unknown'
        }]);

      if (insertError) {
        console.error('❌ Insert failed:', insertError);
      } else {
        console.log('✅ Insert succeeded:', insertData);
      }

      if (insertData?.length) {
        setRequests(prev => [...prev, insertData[0]]);
      }
    }

    setExpandedId(null);
    setName('');
    setSide('A');
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

      <RequestQueue
        requests={requests}
        setRequests={setRequests}
        voteRequest={voteRequest}
      />

      <button onClick={() => setShowBrowser(!showBrowser)} className="browse-button">
        🎧 {showBrowser ? 'Hide Collection' : 'Browse the collection and add your pick'}
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
