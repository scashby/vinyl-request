import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Header from 'components/Header';
import AuthWrapper from 'components/AuthWrapper';
import NowPlayingDisplay from 'components/NowPlayingDisplay';
import CustomerVinylForm from 'components/CustomerVinylForm';
import AdminPanel from 'components/AdminPanel';
import EventDisplay from 'components/EventDisplay';

import 'css/App.css';

function App() {
  const [session, setSession] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [requests, setRequests] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [upNext, setUpNext] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('All');
  const [adminMode, setAdminMode] = useState(false);
  const [events, setEvents] = useState([]);
  const [activeEventId, setActiveEventId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        console.log('Fetched events:', data);
        setEvents(data);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="App">
      <Header />

      <EventDisplay
        events={events}
        activeEventId={activeEventId}
        setActiveEventId={setActiveEventId}
      />


      {activeEventId &&
        events.find((e) => e.id === activeEventId) &&
        new Date(events.find((e) => e.id === activeEventId).date).toDateString() === new Date().toDateString() &&
        nowPlaying && (
          <NowPlayingDisplay nowPlaying={nowPlaying} />
        )}

      <CustomerVinylForm
        activeEventId={activeEventId}
        session={session}
        setRequests={setRequests}
      />

      {adminMode && !session && showLogin && <AuthWrapper />}

      {adminMode && session && (
        <AdminPanel
          adminMode={adminMode}
          setAdminMode={setAdminMode}
          albums={albums}
          setAlbums={setAlbums}
          events={events}
          setEvents={setEvents}
          activeEventId={activeEventId}
          setActiveEventId={setActiveEventId}
          requests={requests}
          setRequests={setRequests}
        />
      )}


    </div>
  );
}

export default App;
