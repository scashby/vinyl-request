// src/components/EventCarousel.js
import React from 'react';
import 'css/EventDisplay.css';

/**
 * Scrollable list of all upcoming events.
 * Highlights the selected one and updates activeEventId on click.
 */
export default function EventCarousel({ events, activeEventId, setActiveEventId }) {
  return (
    <section className="event-carousel">
      <h3>🎟️ Upcoming Events</h3>
      <div className="carousel-scroll">
        {events.map(evt => (
          <div
            key={evt.id}
            className={`event-card ${evt.id === activeEventId ? 'active' : ''}`}
            onClick={() => setActiveEventId(evt.id)}
          >
            <strong>{evt.date}</strong><br />
            <span>{evt.time}</span><br />
            <div>{evt.title}</div>
            <small>{evt.info}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
