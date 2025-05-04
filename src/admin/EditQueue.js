// ✅ Imports
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './EditQueue.css';

// ✅ EditQueue Component
const EditQueue = ({ activeEventId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch requests for the selected event
  useEffect(() => {
    const fetchRequests = async () => {
      if (!activeEventId) return;
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('event_id', activeEventId)
        .neq('status', 'played')
        .order('votes', { ascending: false });

      if (error) {
        setError('Failed to fetch requests.');
        console.error(error);
      } else {
        setRequests(data);
      }

      setLoading(false);
    };

    fetchRequests();
  }, [activeEventId]);

  // ✅ Handle inline updates
  const handleUpdate = async (id, field, value) => {
    const { error } = await supabase
      .from('requests')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      console.error('Update failed:', error);
    } else {
      setRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, [field]: value } : req))
      );
    }
  };

  // ✅ Soft delete by marking played
  const markAsPlayed = async (id) => {
    const { error } = await supabase
      .from('requests')
      .update({ status: 'played' })
      .eq('id', id);

    if (error) {
      console.error('Mark as played failed:', error);
    } else {
      setRequests(prev => prev.filter(req => req.id !== id));
    }
  };

  // ✅ Render
  return (
    <div className="edit-queue">
      <h2>Edit Request Queue</h2>
      {loading ? (
        <p>Loading requests...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="queue-table">
          <thead>
            <tr>
              <th>Artist</th>
              <th>Album</th>
              <th>Side</th>
              <th>Name(s)</th>
              <th>Votes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.artist}</td>
                <td>{req.title}</td>
                <td>
                  <input
                    type="text"
                    value={req.side}
                    onChange={(e) => handleUpdate(req.id, 'side', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={req.name}
                    onChange={(e) => handleUpdate(req.id, 'name', e.target.value)}
                  />
                </td>
                <td>{req.votes}</td>
                <td>
                  <button onClick={() => markAsPlayed(req.id)}>
                    Mark Played
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EditQueue;

