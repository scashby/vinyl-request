// src/components/EventCarousel.js
import React from 'react';
import '../css/EventDisplay.css';

/**
 * Scrollable list of all upcoming events.
 * Highlights the selected one and updates activeEventId on click.
 * Now includes instructive text, better date formatting,
 * and more elegant next event highlighting.
 */
export default function EventCarousel({ events, activeEventId, setActiveEventId }) {
  // Find the next upcoming event (first event whose date is >= today)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  // Sort events by date (ascending)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  // Find the next upcoming event
  const nextEventId = sortedEvents.find(evt => 
    new Date(evt.date) >= today
  )?.id;
  
  // Format a date string to "Month Day, Year" format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="event-carousel">
      <div className="carousel-instructions">
        <p>Click on an event to view its request queue and add your own music picks!</p>
      </div>
      
      <h3>🎟️ Upcoming Events</h3>
      <div className="carousel-scroll">
        {sortedEvents.map(evt => (
          <div
            key={evt.id}
            className={`event-card ${evt.id === activeEventId ? 'active' : ''} ${evt.id === nextEventId ? 'next-event' : ''}`}
            onClick={() => setActiveEventId(evt.id)}
          >
            {evt.id === nextEventId && (
              <div className="next-event-label">
                <span>Next Event</span>
              </div>
            )}
            <strong>{formatDate(evt.date)}</strong><br />
            <span>{evt.time}</span><br />
            <div>{evt.title}</div>
            <small>{evt.info}</small>
          </div>
        ))}
      </div>
    </section>
  );
}