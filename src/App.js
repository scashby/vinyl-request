import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Header from 'components/Header';
import AuthWrapper from 'components/AuthWrapper';
import NowPlayingDisplay from 'components/NowPlayingDisplay';
import CustomerVinylForm from 'components/CustomerVinylForm';
import AdminPanel from 'components/AdminPanel';
import EventDisplay from 'components/EventDisplay';
import EditEvents from 'admin/EditEvents';
import AddCustomerVinyl from 'admin/AddCustomerVinyl';
import EditQueue from 'admin/EditQueue';
import AddAlbumArt from 'admin/AddAlbumArt';
import AddTrackListings from 'admin/AddTrackListings';
import ReturnToHome from 'admin/ReturnToHome';
import LogoutAdmin from 'admin/LogoutAdmin';
import BrowseCollectionPage from 'components/BrowseCollectionPage';
import BackfillMissingData from 'admin/BackfillMissingData';

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
        setEvents(data);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Router>
      <div className="App">
        <Header
          session={session}
          setSession={setSession}
          adminMode={adminMode}
          setAdminMode={setAdminMode}
          showLogin={showLogin}
          setShowLogin={setShowLogin}
        />

<Routes>
  <Route
    path="/"
    element={
      <>
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
      </>
    }
  />
      <Route path="/browse/:eventId" element={<BrowseCollectionPage />} />

    <Route path="/admin" element={<AdminPanel />}>
      <Route path="edit-events" element={<EditEvents />} />
      <Route path="add-customer-vinyl" element={<AddCustomerVinyl />} />
      <Route path="edit-queue" element={<EditQueue />} />
      <Route path="replace-album-art" element={<AddAlbumArt />} />
      <Route path="replace-track-listings" element={<AddTrackListings />} />
      <Route path="backfill-missing-data" element={<BackfillMissingData />} />
      <Route path="return-home" element={<ReturnToHome />} />
      <Route path="logout" element={<LogoutAdmin />} />
    </Route>

</Routes>

      </div>
    </Router>
  );
}

export default App;
