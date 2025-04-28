// src/components/CustomerVinylForm.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../css/CustomerVinylForm.css';


const CustomerVinylForm = ({ activeEventId, isAdmin }) => {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [side, setSide] = useState('A');
  const [name, setName] = useState('');

  if (!isAdmin) return null; // Only show for admin

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!artist.trim() || !title.trim()) {
      alert('Artist and title are required.');
      return;
    }

    const newRequest = {
      artist: artist.trim(),
      title: title.trim(),
      side,
      name: name.trim(),
      status: 'pending',
      votes: 1,
      timestamp: new Date().toISOString(),
      event_id: activeEventId,
    };

    const { error } = await supabase.from('requests').insert([newRequest]);

    if (error) {
      console.error('Error submitting vinyl:', error.message);
      alert('Submission failed.');
    } else {
      setArtist('');
      setTitle('');
      setSide('A');
      setName('');
    }
  };

  return (
    <section className="manual-entry">
      <h3>➕ Add Customer Vinyl</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Album Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select value={side} onChange={(e) => setSide(e.target.value)}>
          {['A', 'B', 'C', 'D', 'E', 'F'].map((s) => (
            <option key={s} value={s}>{`Side ${s}`}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Customer Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Submit Vinyl</button>
      </form>
    </section>
  );
};

export default CustomerVinylForm;
