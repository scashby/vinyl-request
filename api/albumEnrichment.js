// src/api/albumEnrichment.js
import { supabase } from '../supabaseClient';

// Fetch album data from Discogs
export const fetchFromDiscogs = async (artist, title) => {
  try {
    // Assuming you have a Discogs API integration in your api/discogs.js file
    const { fetchFromDiscogs } = await import('./discogs');
    return await fetchFromDiscogs(artist, title);
  } catch (error) {
    console.error('Error fetching from Discogs:', error);
    return null;
  }
};

// Fetch album data from MusicBrainz
export const fetchFromMusicBrainz = async (artist, title) => {
  try {
    // Assuming you have a MusicBrainz API integration in your api/musicbrainz.js file
    const { fetchFromMusicBrainz } = await import('./musicbrainz');
    return await fetchFromMusicBrainz(artist, title);
  } catch (error) {
    console.error('Error fetching from MusicBrainz:', error);
    return null;
  }
};

// Fetch album data from iTunes
export const fetchFromITunes = async (artist, title) => {
  try {
    // Assuming you have an iTunes API integration in your api/itunes.js file
    const { fetchFromITunes } = await import('./itunes');
    return await fetchFromITunes(artist, title);
  } catch (error) {
    console.error('Error fetching from iTunes:', error);
    return null;
  }
};

// Main function to fetch album data from all sources
export const fetchAlbumData = async (album) => {
  // First check if we already have cached data
  const { data: cachedData } = await supabase
    .from('collection')
    .select('sides')
    .eq('id', album.id)
    .single();
  
  if (cachedData && cachedData.sides && Object.keys(cachedData.sides).length > 0) {
    return cachedData;
  }
  
  // Try Discogs first
  try {
    const discogsData = await fetchFromDiscogs(album.artist, album.title);
    if (discogsData && discogsData.sides) {
      return discogsData;
    }
  } catch (error) {
    console.error('Error fetching from Discogs:', error);
  }
  
  // If Discogs fails, try MusicBrainz
  try {
    const musicBrainzData = await fetchFromMusicBrainz(album.artist, album.title);
    if (musicBrainzData && musicBrainzData.sides) {
      return musicBrainzData;
    }
  } catch (error) {
    console.error('Error fetching from MusicBrainz:', error);
  }
  
  // If MusicBrainz fails, try iTunes
  try {
    const itunesData = await fetchFromITunes(album.artist, album.title);
    if (itunesData && itunesData.sides) {
      return itunesData;
    }
  } catch (error) {
    console.error('Error fetching from iTunes:', error);
  }
  
  // If all sources fail, return null
  return null;
};