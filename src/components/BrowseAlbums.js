// ✅ Imports
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import 'css/BrowseAlbums.css';
import FilterBar from 'components/FilterBar';
import ExpandableAlbumCard from 'components/ExpandableAlbumCard';
import 'css/expandableAlbumCard.css';

// ✅ BrowseAlbums component
const BrowseAlbums = ({
  activeEventId,
  handleSubmit: parentHandleSubmit,
  expandedId,
  setExpandedId,
  side,
  setSide,
  name,
  setName,
}) => {
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaType, setMediaType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

  // ✅ Fetch albums on mount
  useEffect(() => {
    const fetchAlbums = async () => {
      console.log('fetchAlbums function is running');
      setIsLoading(true);

      const { data, error } = await supabase
        .from('collection')
        .select('*')
        .order('artist', { ascending: true });

      console.log('Albums fetched from Supabase:', data ? data.length : 'No data');

      if (error) {
        console.error('Error fetching albums:', error);
        setIsLoading(false);
        return;
      }

      setAlbums(data);
      console.log('🧪 Sample fetched albums:', data.slice(0, 5));
      setFilteredAlbums(data);
      setIsLoading(false);
    };

    fetchAlbums();
  }, []);

  // ✅ Fetch current event when activeEventId changes
  useEffect(() => {
    const fetchCurrentEvent = async () => {
      if (!activeEventId) return;

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', activeEventId)
        .single();

      if (error) {
        console.error('Error fetching current event:', error);
        return;
      }

      setCurrentEvent(data);
    };

    fetchCurrentEvent();
  }, [activeEventId]);

  // ✅ Filter albums when search term or media type changes
  useEffect(() => {
    console.log('🎛 Filtering albums with mediaType:', mediaType);
    console.log('📁 All folder values:', albums.map(a => a.folder));

    let filtered = albums;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (album) =>
          album.title?.toLowerCase().includes(term) ||
          album.artist?.toLowerCase().includes(term)
      );
    }

    // 🛠 Fixed casing mismatch: compare folder and mediaType using toLowerCase
    if (mediaType !== 'All') {
      filtered = filtered.filter((album) =>
        album.folder?.toLowerCase() === mediaType.toLowerCase()
      );
    }

    console.log('✅ Resulting filtered albums:', filtered.length);
    setFilteredAlbums(filtered);
  }, [searchTerm, mediaType, albums]);

  // ✅ Handle album click
  const handleAlbumClick = (albumId) => {
    setExpandedId(albumId === expandedId ? null : albumId);
    setSide('A');
  };

  // ✅ Handle close of expanded album card
  const handleCloseExpandedCard = () => {
    setExpandedId(null);
  };

  // ✅ Enhanced handleSubmit with duplicate detection and proper insert prevention
  const handleSubmit = async (album) => {
    if (!activeEventId) {
      setRequestStatus({
        success: false,
        message: 'Please select an event first'
      });
      return;
    }

    try {
      // ✅ Check if this album+side+event already exists in the queue
      const { data: existingRequests, error: checkError } = await supabase
        .from('requests')
        .select('id, votes, name')
        .eq('album_id', album.id)
        .eq('side', side)
        .eq('event_id', activeEventId);

      if (checkError) {
        console.error('Error checking for existing requests:', checkError);
        setRequestStatus({
          success: false,
          message: 'Error checking for existing requests'
        });
        return;
      }

      if (existingRequests && existingRequests.length > 0) {
        // ✅ Match found — update existing request
        const existingRequest = existingRequests[0];

        const updatedName = existingRequest.name.includes(name)
          ? existingRequest.name
          : `${existingRequest.name}, ${name}`;

        const { error: updateError } = await supabase
          .from('requests')
          .update({
            votes: existingRequest.votes + 1,
            name: updatedName
          })
          .eq('id', existingRequest.id);

        if (updateError) {
          console.error('Error updating request:', updateError);
          setRequestStatus({
            success: false,
            message: 'Error updating request'
          });
          return;
        }

        setRequestStatus({
          success: true,
          message: 'Request upvoted successfully!'
        });

        // 🛠 Moved state reset above return to prevent insert fallback
        setName('');
        setExpandedId(null);
        setSide('A');

        if (parentHandleSubmit) {
          parentHandleSubmit(album);
        }

        return; // ✅ Prevent fallback insert after update
      }

      // ✅ No match found — create new request
      const { error: insertError } = await supabase
        .from('requests')
        .insert({
          artist: album.artist,
          title: album.title,
          side,
          name,
          status: 'pending',
          votes: 1,
          folder: album.folder,
          year: album.year,
          format: album.format,
          album_id: album.id,
          event_id: activeEventId
        });

      if (insertError) {
        console.error('Error submitting request:', insertError);
        setRequestStatus({
          success: false,
          message: 'Error submitting request'
        });
        return;
      }

      setRequestStatus({
        success: true,
        message: 'Request submitted successfully!'
      });

      setName('');
      setExpandedId(null);
      setSide('A');

      if (parentHandleSubmit) {
        parentHandleSubmit(album);
      }
    } catch (error) {
      console.error('Error handling request:', error);
      setRequestStatus({
        success: false,
        message: 'An error occurred while processing your request'
      });
    }
  };

  // ✅ Render component
  return (
    <div className="browse-albums">
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by artist or title"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterBar mediaType={mediaType} setMediaType={setMediaType} />
      </div>

      {/* ✅ Request status message */}
      {requestStatus && (
        <div className={`status-message ${requestStatus.success ? 'success' : 'error'}`}>
          {requestStatus.message}
        </div>
      )}

      {/* ✅ Loading indicator */}
      {isLoading ? (
        <div className="loading">Loading albums...</div>
      ) : (
        // ✅ Album grid 
        <div className="album-grid">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              className={`album-card ${expandedId === album.id ? 'expanded' : ''}`}
              onClick={() => handleAlbumClick(album.id)}
            >
              <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                {album.image_url && album.image_url !== 'no' ? (
                  <img
                    src={album.image_url}
                    alt={`${album.artist} - ${album.title}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      console.error('Image load failed for:', album.artist, album.title);
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* ✅ Placeholder black box if no image */}
                <div
                  className="album-placeholder"
                  style={{
                    display: (!album.image_url || album.image_url === 'no') ? 'flex' : 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black',
                    color: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '5px',
                    fontSize: '0.9em',
                  }}
                >
                  {album.artist} – {album.title}
                </div>
              </div>

              {/* ✅ Album info under image/placeholder */}
              <div
                className="album-info-text"
                style={{ marginTop: '5px', textAlign: 'center', fontSize: '0.85em' }}
              >
                {album.artist} – {album.title}
              </div>

              {/* ✅ Legacy request form if needed (consider removing after full migration) */}
              {expandedId === album.id && !currentEvent && (
                <div className="request-form">
                  <select value={side} onChange={(e) => setSide(e.target.value)}>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((s) => (
                      <option key={s} value={s}>
                        Side {s}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button onClick={() => handleSubmit(album)}>Add to Queue</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ✅ No results message */}
      {filteredAlbums.length === 0 && !isLoading && (
        <div className="no-results">No albums found matching your search.</div>
      )}
      
      {/* ✅ New Expandable Album Card */}
      {expandedId && (
        <ExpandableAlbumCard
          album={albums.find(album => album.id === expandedId)}
          currentEvent={currentEvent}
          onClose={handleCloseExpandedCard}
          onSideSelect={setSide}
          selectedSide={side}
          onNameChange={setName}
          name={name}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default BrowseAlbums;
