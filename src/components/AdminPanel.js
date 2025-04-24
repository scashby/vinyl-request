// src/components/AdminPanel.js
import React from 'react';
import 'css/AdminPanel.css';


const AdminPanel = ({
  adminMode,
  setAdminMode,
  eventDate,
  setEventDate,
  eventTime,
  setEventTime,
  eventTitle,
  setEventTitle,
  eventInfo,
  setEventInfo,
  editingEvent,
  handleEventFormSubmit,
  events
}) => {
  return (
    <section className="admin-controls">
      <label>
        <input
          type="checkbox"
          checked={adminMode}
          onChange={() => setAdminMode(!adminMode)}
        />
        Admin Mode
      </label>

      {adminMode && (
        <div className="event-editor">
          <h3>🛠️ Edit Events</h3>
          <form onSubmit={handleEventFormSubmit}>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Event Title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Additional Info"
              value={eventInfo}
              onChange={(e) => setEventInfo(e.target.value)}
            />
            <button type="submit">{editingEvent ? 'Update' : 'Add'} Event</button>
          </form>

          <ul className="event-list">
            {events.map((evt) => (
              <li key={evt.id}>
                <strong>{evt.date}</strong> — {evt.title} <em>({evt.time})</em>
                <br />
                <small>{evt.info}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default AdminPanel;
