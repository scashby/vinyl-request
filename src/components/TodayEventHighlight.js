// src/components/TodayEventHighlight.js
import React from 'react';
import NowPlayingDisplay from './NowPlayingDisplay';
import UpNextDisplay from './UpNextDisplay';
import RequestQueue from './RequestQueue';
import 'css/EventDisplay.css'; // Reuses same styling

/**
 * Displays the featured event for today, including Now Playing,
 * Up Next, and the full request queue for that event.
 */
export default function TodayEventHighlight({ event, requests }) {
  return (
    <div className="today-event-highlight">
      <h2>🎉 Happening Today: {event.title}</h2>
      <p>
        <strong>{new Date(event.date).toLocaleDateString('en-US')}</strong> — {event.time}<br />
        {event.info}
      </p>

      {/* These 3 displays were previously inside EventDisplay.js */}
      <NowPlayingDisplay requests={requests} />
      <UpNextDisplay requests={requests} />
      <RequestQueue requests={requests} />
    </div>
  );
}
