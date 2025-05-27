// src/components/EventDisplay.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import TodayEventHighlight from './TodayEventHighlight';
import EventCarousel from './EventCarousel';
import ExpandedEvent from './ExpandedEvent'; // ✅ make sure this is created
import '../css/EventDisplay.css';

export default function EventDisplay({ events, activeEventId, setActiveEventId }) {
  const [todayEvent, setTodayEvent] = useState(null);
  const [todayRequests, setTodayRequests] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null); // ✅ now inside the function

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const found = events.find(evt => evt.date === todayStr);
    if (found) {
      setTodayEvent(found);
      setActiveEventId(found.id);
    }
  }, [events, setActiveEventId]);

  useEffect(() => {
    async function fetchRequests() {
      if (!activeEventId) return;
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('event_id', activeEventId)
        .order('votes', { ascending: false });
      if (!error) setTodayRequests(data || []);
    }
    fetchRequests();
  }, [activeEventId]);

  return (
    <div className="event-display-wrapper">
      {todayEvent && (
        <TodayEventHighlight
          event={todayEvent}
          requests={todayRequests}
        />
      )}

      {expandedEvent ? (
        <ExpandedEvent
          event={expandedEvent}
          onBack={() => setExpandedEvent(null)}
        />
      ) : (
        <EventCarousel
          events={events.filter(evt => evt.id !== todayEvent?.id)}
          activeEventId={activeEventId}
          setActiveEventId={id => {
            setActiveEventId(id);
            const selected = events.find(evt => evt.id === id);
            setExpandedEvent(selected);
          }}
        />
      )}
    </div>
  );
}
