import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);
  
  const [collection, setCollection] = useState([]);
  const [requests, setRequests] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [side, setSide] = useState('A');
  const [name, setName] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [albumImages, setAlbumImages] = useState({});
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewQueue, setViewQueue] = useState(false);
  const [customArtist, setCustomArtist] = useState('');
  
  const [events, setEvents] = useState([]);
  const [activeEventId, setActiveEventId] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [customTitle, setCustomTitle] = useState('');
  const [nowPlaying, setNowPlaying] = useState(null);
  // const [requestStart, setRequestStart] = useState(''); *commenting out until sure not needed*
  // const [requestEnd, setRequestEnd] = useState(''); *commenting out until sure not needed*

  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventInfo, setEventInfo] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  
  
  
  

  // const isWithinRequestWindow = () => {
  //  if (adminMode) return true;
  //  const now = new Date();
  //  const start = requestStart ? new Date(requestStart) : null;
  //  const end = requestEnd ? new Date(requestEnd) : null;
  //  return (!start || now >= start) && (!end || now <= end);
  // };

  const fetchCoverArt = async (album) => {
    const searchTerm = encodeURIComponent(`${album.artist} ${album.title}`);
    try {
      const iTunesRes = await fetch(`https://itunes.apple.com/search?term=${searchTerm}&entity=album&limit=1`);
      const iTunesData = await iTunesRes.json();
      if (iTunesData.results?.length > 0) {
        return iTunesData.results[0].artworkUrl100.replace('100x100bb', '400x400bb');
      }
      const mbidRes = await fetch(`https://musicbrainz.org/ws/2/release/?query=${searchTerm}&fmt=json`);
      const mbidData = await mbidRes.json();
      const release = mbidData.releases?.[0];
      if (release?.id) {
        return `https://coverartarchive.org/release/${release.id}/front-500.jpg`;
      }
    } catch (e) {
      console.warn('Image fetch error:', e);
    }
    return null;
  };

  const renderFallbackBox = (artist, title, size = 200) => (
    <div style={{
      width: size,
      height: size,
      backgroundColor: '#1e1e1e',
      color: '#f4f1e6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: size < 100 ? '0.65rem' : '0.9rem',
      padding: '0.5rem',
      borderRadius: '6px'
    }}>
      {artist} – {title}
    </div>
  );

  const exportToCSV = () => {
    const csvRows = [
      ['Artist', 'Title', 'Side', 'Requested By', 'Status', 'Votes', 'Timestamp'],
      ...requests.map(req => [
        req.artist,
        req.title,
        req.side,
        req.name || '',
        req.status,
        req.votes || 1,
        req.timestamp
      ])
    ];
    const csv = csvRows.map(row => row.map(val => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vinyl_requests.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    async function fetchCollection() {
      const { data, error } = await supabase.from('collection').select('*').order('artist');
      if (error) {
        console.error('Error loading collection:', error);
      } else {
        setCollection(data);
        const entries = await Promise.all(data.map(async (album) => {
          const coverUrl = await fetchCoverArt(album);
          return [album.id, coverUrl];
        }));
        setAlbumImages(Object.fromEntries(entries));
      }
    }
    fetchCollection();
  }, []);

  useEffect(() => {
    if (!activeEventId) return;
  
    async function fetchRequests() {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('event_id', activeEventId)
        .order('timestamp', { ascending: true });
  
      if (error) {
        console.error('Error loading requests:', error);
      } else {
        const nowPlayingItem = data.find(r => r.status === 'now_playing');
        setNowPlaying(nowPlayingItem || null);
        setRequests(data.filter(r => r.status !== 'now_playing' && r.status !== 'played'));
      }
    }
  
    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, [activeEventId]);
  
  const visibleAlbums = collection.filter(album => {
    if (filter !== 'All' && album.folder !== filter) return false;
    if (search && !`${album.artist} ${album.title}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  
  // Place this right above useEffect


// Then use it here:


useEffect(() => {
  const fetch = async () => {
    const { data, error } = await supabase.from('events').select('*').order('date');
    if (error) {
      console.error('Error loading events:', error);
    } else {
      setEvents(data);
      if (!activeEventId && data.length > 0) {
        setActiveEventId(data[0].id);
        setActiveEvent(data[0]);
      }
    }
  };
  fetch();
}, [activeEventId]);

  
  const handleSubmit = async (album) => {
    if (!session) {
      alert('You must be logged in to submit a request.');
      return;
    }
    if (!album) return;
    const newRequest = {
      artist: album.artist,
      title: album.title,
      side,
      name,
      status: 'pending',
      votes: 1,
      timestamp: new Date().toISOString(),
      album_id: album.id,
      event_id: activeEventId,
    };
    const { error } = await supabase.from('requests').insert([newRequest]);
    if (error) {
      console.error('Error saving request:', error.message);
      alert(`Error: ${error.message}`);
    } else {
      setExpandedId(null);
      setSide('A');
      setName('');
    }
  };

  
  const handleManualAdd = async () => {
    if (!session) {
      alert('You must be logged in to submit a request.');
      return;
    } 
    if (!customArtist.trim() || !customTitle.trim()) return;
    const customAlbum = {
      artist: customArtist.trim(),
      title: customTitle.trim(),
      side,
      name,
      status: 'pending',
      votes: 1,
      timestamp: new Date().toISOString(),
      event_id: activeEventId,
    };
    const { error } = await supabase.from('requests').insert([customAlbum]);
    if (error) {
      console.error('Error saving request:', error.message);
      alert(`Error: ${error.message}`);
    } else {
      setCustomArtist('');
      setCustomTitle('');
      setSide('A');
      setName('');
    }
  };
  const handleEventFormSubmit = async (e) => {
    e.preventDefault();
    if (!session || !eventDate.trim() || !eventTime.trim() || !eventTitle.trim()) {
      alert('You must be logged in to add or edit events.');
      return;
    }
    
  
    const eventPayload = {
      date: eventDate.trim(),
      time: eventTime.trim(),
      title: eventTitle.trim(),
      info: eventInfo.trim()
    };
  
    let result;
    if (editingEvent) {
      result = await supabase
        .from('events')
        .update(eventPayload)
        .eq('id', editingEvent.id);
    } else {
      result = await supabase.from('events').insert([eventPayload]);
    }
  
    if (result.error) {
      console.error('Event save error:', result.error.message);
      alert(`Error: ${result.error.message}`);
    } else {
      setEventDate('');
      setEventTime('');
      setEventTitle('');
      setEventInfo('');
      setEditingEvent(null);
      const { data } = await supabase.from('events').select('*').order('date');
      setEvents(data);
      console.log('Fetched updated event list:', data);
    }
  };
  
  const markNowPlaying = async (id) => {
    const current = requests.find(r => r.id === id);
    if (!current) return;

    const updates = requests.map((r) =>
      r.status === 'playing'
        ? { ...r, status: 'played' }
        : r.id === id
        ? { ...r, status: 'playing' }
        : r
    );

    const { error } = await supabase.from('requests').upsert(updates, { onConflict: 'id' });
    if (error) {
      console.error('Failed to update Now Playing:', error.message);
      alert(`Failed to update Now Playing: ${error.message}`);
    } else {
      const { data } = await supabase.from('requests').select('*').order('timestamp');
      setRequests(data || []);
      const playing = data?.find(r => r.status === 'playing');
      setNowPlaying(playing || null);
    }
  };

  const markPlayed = async (index) => {
    const updated = [...requests];
    updated[index].status = 'played';
    setRequests(updated);
  };

  const deleteRequest = async (id) => {
    const { error } = await supabase.from('requests').delete().eq('id', id);
    if (error) console.error('Error deleting request:', error.message);
    else setRequests(requests.filter(r => r.id !== id));
  };

  
  return (
    <div className="app-container">
      {!session ? (
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      ) : (
        <>
      <header className="app-header">
        <a href="https://www.devilspurse.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://d1ynl4hb5mx7r8.cloudfront.net/wp-content/uploads/2015/06/devils-purse-300x300.png"
            alt="Devil’s Purse Logo"
            className="logo"
          />
        </a>
        <div>
          <h1>BYOVinyl (and Cassettes) at Devil’s Purse</h1>
          <h2>Request Queue</h2>
        </div>
      </header>

      {/* INTRO */}
      <section className="intro-text">
        <p>
          Browse our curated collection of vinyl albums, 45s, and vintage cassettes—or bring your own!
          Add your favorites to the request queue in advance, or check what’s playing and what’s coming up.
          Use the buttons below to toggle between the album view and request list.
        </p>
      </section>

      {/* NOW PLAYING / UP NEXT */}
      <section className="now-playing-upnext">
        {nowPlaying && (
          <div className="now-playing">
            <h3>🎧 Now Playing</h3>
            <div className="album-info">
              {albumImages[nowPlaying.album_id || nowPlaying.id]
                ? <img src={albumImages[nowPlaying.album_id || nowPlaying.id]} alt="Now Playing" />
                : renderFallbackBox(nowPlaying.artist, nowPlaying.title, 100)}
              <div>
                <strong>{nowPlaying.artist} – {nowPlaying.title}</strong><br />
                Side {nowPlaying.side} {nowPlaying.name && <>• Requested by {nowPlaying.name}</>}
              </div>
            </div>
          </div>
        )}
        {requests.length > 0 && (
          <div className="up-next">
            <h3>🔜 Up Next</h3>
            {requests.filter(r => r.status !== 'played' && r.status !== 'playing')
              .sort((a, b) => (b.votes || 1) - (a.votes || 1))
              .slice(0, 1)
              .map(next => (
                <div className="album-info" key={next.id}>
                  {albumImages[next.album_id || next.id]
                    ? <img src={albumImages[next.album_id || next.id]} alt="Up Next" />
                    : renderFallbackBox(next.artist, next.title, 100)}
                  <div>
                    <strong>{next.artist} – {next.title}</strong><br />
                    Side {next.side} {next.name && <>• Requested by {next.name}</>}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
      {activeEvent && (
  <div className="event-details">
    <h3 style={{ marginBottom: 0 }}>{activeEvent.title}</h3>
    <p style={{ marginTop: 4 }}>{activeEvent.date} — {activeEvent.time}</p>
    <p style={{ marginTop: 0, fontStyle: 'italic' }}>{activeEvent.info}</p>
  </div>
)}

      
      {/* EVENT SELECTOR */}
      <section className="event-carousel">
        <h3>🎟️ Upcoming Events</h3>
        <div className="carousel-scroll">
          {events.map(evt => (
            <div
              key={evt.id}
              className={`event-card ${evt.id === activeEventId ? 'active' : ''}`}
              onClick={() => {
                setActiveEventId(evt.id);
                setActiveEvent(evt);
                setEditingEvent(evt);
                setEventDate(evt.date || '');
                setEventTime(evt.time || '');
                setEventTitle(evt.title || '');
                setEventInfo(evt.info || '');
              }}              
            >
              <strong>{evt.date}</strong><br />
              <span>{evt.time}</span><br />
              <div>{evt.title}</div>
              <small>{evt.info}</small>
            </div>
          ))}
        </div>
      </section>


    {/* CONTROLS */}
      <section className="controls">
        <input
          type="text"
          placeholder="Search artist or album..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filters">
          {['All', 'Vinyl', '45s', 'Cassettes'].map(type => (
            <button key={type} onClick={() => setFilter(type)} className={filter === type ? 'active' : ''}>
              {type}
            </button>
          ))}
          <button onClick={() => setViewQueue(!viewQueue)}>{viewQueue ? 'Browse Collection' : 'View Queue'}</button>
          <button onClick={() => setAdminMode(!adminMode)}>{adminMode ? 'Admin Off' : 'Admin On'}</button>
          {adminMode && <button onClick={exportToCSV}>Export CSV</button>}
        </div>
        {adminMode && (
          <form onSubmit={handleEventFormSubmit} className="event-form">
            <h4>{editingEvent ? '✏️ Edit Event' : '➕ Add New Event'}</h4>
            <div className="form-grid">
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              placeholder="Date"
            />
              <input
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="Time (e.g., 12–6pm)"
                required
              />
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Title (e.g., Record Store Day Special)"
                required
              />
              <input
                type="text"
                value={eventInfo}
                onChange={(e) => setEventInfo(e.target.value)}
                placeholder="Extra info (optional)"
              />
            </div>
            <button type="submit">{editingEvent ? 'Update Event' : 'Add Event'}</button>
          </form>
        )}

      </section>
      {adminMode && (
        <section className="event-editor">
          <h3>🛠️ Edit Events</h3>
          <ul className="event-list">
            {events.map(evt => (
              <li key={evt.id}>
                <strong>{evt.date}</strong> — {evt.title} <em>({evt.time})</em>
                <br />
                <small>{evt.info}</small>
              </li>
            ))}
          </ul>
          {/* Optionally add event creation form here in future */}
        </section>
      )}

      {/* MAIN VIEW: QUEUE OR BROWSE */}
      {viewQueue ? (
        <section className="queue-list">
          {activeEvent && (
            <div className="queue-event-banner">
            <h2>Requests for: {activeEvent.title || activeEvent.date}</h2>
            <p>{activeEvent.date} • {activeEvent.time}</p>
            </div>
          )}
          <h3>📋 Request Queue</h3>
          {activeEvent && (
            <div className="event-label">
              <h3>📅 Viewing Queue for: <span>{activeEvent.title}</span> – {activeEvent.date}</h3>
             </div>
          )}
          {requests.map((req, index) => (
            <div key={req.id} className="queue-item">
              {albumImages[req.album_id || req.id]
                ? <img src={albumImages[req.album_id || req.id]} alt="Cover" />
                : renderFallbackBox(req.artist, req.title, 60)}
              <div>
                <strong>{req.artist} – {req.title}</strong><br />
                Side {req.side} {req.name && <>• Requested by {req.name}</>}<br />
                Status: {req.status} • Votes: {req.votes || 1}
              </div>
              {adminMode && (
                <div className="admin-actions">
                  <button onClick={() => markNowPlaying(req.id)}>Now Playing</button>
                  <button onClick={() => markPlayed(index)}>Played</button>
                  <button onClick={() => deleteRequest(req.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </section>
      ) : (
        <section className="browse-grid">
          <h3>🎶 Browse Albums</h3>
          <div className="album-grid">
            {visibleAlbums.map(album => (
              <div key={album.id} className="album-card" onClick={() => setExpandedId(album.id)}>
                {albumImages[album.id]
                  ? <img src={albumImages[album.id]} alt="Album Art" />
                  : renderFallbackBox(album.artist, album.title)}
                <div className="album-meta">
                  <strong>{album.artist}</strong><br />
                  {album.title}
                </div>
              </div>
            ))}
          </div>

          {expandedId && (
            <div className="request-form">
              <h3>📀 Request This Album</h3>
              <label>Side:
                <select value={side} onChange={(e) => setSide(e.target.value)}>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(s => (
                    <option key={s} value={s}>Side {s}</option>
                  ))}
                </select>
              </label>
              <label>Your Name (optional):
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <button onClick={() => handleSubmit(collection.find(c => c.id === expandedId))}>Submit Request</button>
            </div>
          )}

          {adminMode && (
            <div className="manual-entry-form">
              <h3>📝 Add Customer Vinyl/Cassette</h3>
              <label>Artist:
                <input value={customArtist} onChange={(e) => setCustomArtist(e.target.value)} />
              </label>
              <label>Album Title:
                <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
              </label>
              <label>Side:
                <select value={side} onChange={(e) => setSide(e.target.value)}>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(s => (
                    <option key={s} value={s}>Side {s}</option>
                  ))}
                </select>
              </label>
              <label>Your Name (optional):
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <button onClick={handleManualAdd}>Add to Queue</button>
            </div>
          )}
                </section>
      )}
        </>
      )}
    </div>
  );
}

export default App;



