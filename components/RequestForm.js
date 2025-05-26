// src/components/RequestForm.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '@supabase/auth-helpers-react';

const RequestForm = ({ album, selectedSide, currentEvent }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const user = useUser();

  // Check if the event queue is locked (24 hours before event)
  const isQueueLocked = () => {
    if (!currentEvent || !currentEvent.date) return false;
    
    const eventDate = new Date(currentEvent.date);
    const eventTime = currentEvent.time ? currentEvent.time.split(':') : ['00', '00'];
    eventDate.setHours(parseInt(eventTime[0]), parseInt(eventTime[1]), 0, 0);
    
    const lockTime = new Date(eventDate);
    lockTime.setHours(lockTime.getHours() - 24);
    
    return new Date() >= lockTime;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentEvent) {
      setRequestStatus({
        success: false,
        message: 'No event selected. Please select an event to request music for.'
      });
      return;
    }
    
    if (isQueueLocked()) {
      setRequestStatus({
        success: false,
        message: 'Queue is locked. Requests for this event are no longer accepted.'
      });
      return;
    }
    
    if (!selectedSide) {
      setRequestStatus({
        success: false,
        message: 'Please select a side to request.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if this album+side is already in the queue for this event
      const { data: existingRequests } = await supabase
        .from('requests')
        .select('id, votes')
        .eq('album_id', album.id)
        .eq('side', selectedSide)
        .eq('event_id', currentEvent.id);
      
      if (existingRequests && existingRequests.length > 0) {
        // Album+side already exists in queue, upvote it
        const existingRequest = existingRequests[0];
        const { error: updateError } = await supabase
          .from('requests')
          .update({ votes: existingRequest.votes + 1 })
          .eq('id', existingRequest.id);
        
        if (updateError) throw updateError;
        
        setRequestStatus({
          success: true,
          message: 'Upvoted existing request! Your vote has been added.'
        });
      } else {
        // Create new request
        const userName = user ? user.email : 'Anonymous';
        
        const { error: insertError } = await supabase
          .from('requests')
          .insert({
            artist: album.artist,
            title: album.title,
            side: selectedSide,
            name: userName,
            status: 'pending',
            votes: 1,
            folder: album.folder,
            year: album.year,
            format: album.format,
            album_id: album.id,
            event_id: currentEvent.id
          });
        
        if (insertError) throw insertError;
        
        setRequestStatus({
          success: true,
          message: 'Album requested successfully!'
        });
      }
      
      // Clear form
      setMessage('');
    } catch (error) {
      console.error('Error submitting request:', error);
      setRequestStatus({
        success: false,
        message: 'Failed to submit request. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-form">
      <h3>Request for {currentEvent?.title || 'Event'}</h3>
      
      {isQueueLocked() ? (
        <div className="queue-locked-message">
          <p>Queue is locked. Requests for this event are no longer accepted.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="message">Message (optional):</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note to your request"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting || !selectedSide || !currentEvent}
            className="request-button"
          >
            {isSubmitting ? 'Submitting...' : 'Request This Side'}
          </button>
          
          {requestStatus && (
            <div className={`status-message ${requestStatus.success ? 'success' : 'error'}`}>
              {requestStatus.message}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default RequestForm;