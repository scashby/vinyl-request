// src/utils/requestUtils.js
import { supabase } from '../supabaseClient';

export const handleAlbumRequest = async ({
  album,
  side,
  name,
  eventId,
  onSuccess, // Callback for success
  onError,   // Callback for errors
  skipParentCallback = false // Flag to prevent duplicate processing
}) => {
  if (!eventId) {
    if (onError) onError('Please select an event first');
    return null;
  }
  
  try {
    // Check for existing requests
    const { data: existingRequests, error: checkError } = await supabase
      .from('requests')
      .select('id, votes, name')
      .eq('album_id', album.id)
      .eq('side', side)
      .eq('event_id', eventId);
    
    if (checkError) {
      console.error('Error checking for existing requests:', checkError);
      if (onError) onError('Error checking for existing requests');
      return null;
    } 
    
    // If request exists, update it
    if (existingRequests && existingRequests.length > 0) {
      const existingRequest = existingRequests[0];
      
      const updatedName = existingRequest.name.includes(name)
        ? existingRequest.name
        : `${existingRequest.name}, ${name}`;
      
      const { data, error: updateError } = await supabase
        .from('requests')
        .update({
          votes: existingRequest.votes + 1,
          name: updatedName
        })
        .eq('id', existingRequest.id)
        .select();
      
      if (updateError) {
        console.error('Error updating request:', updateError);
        if (onError) onError('Error updating request');
        return null;
      }
      
      if (onSuccess) onSuccess('Request upvoted successfully!', data, true);
      return { ...data[0], wasUpdated: true };
    } 
    // Otherwise create new request
    else {
      // Guard against missing data
      if (!album.id || !side || !eventId) {
        console.warn('Missing critical data for insert', { album, side, eventId });
        if (onError) onError('Missing data required for request');
        return null;
      }
      
      const { data, error: insertError } = await supabase
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
          event_id: eventId
        })
        .select();
      
      if (insertError) {
        console.error('Error submitting request:', insertError);
        if (onError) onError('Error submitting request');
        return null;
      }
      
      if (onSuccess) onSuccess('Request submitted successfully!', data, false);
      return { ...data[0], wasUpdated: false };
    }
  } catch (error) {
    console.error('Error handling request:', error);
    if (onError) onError('An error occurred while processing your request');
    return null;
  }
};