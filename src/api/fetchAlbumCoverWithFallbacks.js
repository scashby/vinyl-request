import { searchDiscogsRelease } from './discogs';
import { fetchAlbumArtFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID } from './musicbrainz';
import { supabase } from '../supabaseClient'; // Make sure you import this at the top!

async function fetchFromDiscogs(artist, title) {
  try {
    const results = await searchDiscogsRelease(artist, title);
    if (results && results.length > 0) {
      return results[0].cover_image;
    }
  } catch (error) {
    console.error('Discogs fallback failed:', error);
  }
  return null;
}

async function fetchFromItunes(artist, title) {
  try {
    const url = await fetchAlbumArtFromiTunes(artist, title);
    return url;
  } catch (error) {
    console.error('iTunes fallback failed:', error);
  }
  return null;
}

async function fetchFromMusicbrainz(artist, title) {
  try {
    const url = await fetchCoverArtFromMBID(artist, title);
    return url;
  } catch (error) {
    console.error('MusicBrainz fallback failed:', error);
  }
  return null;
}

export async function fetchAlbumCoverWithFallbacks(artist, title, albumId) {
  const fallbackSources = [fetchFromDiscogs, fetchFromItunes, fetchFromMusicbrainz];

  for (const fetchSource of fallbackSources) {
    const url = await fetchSource(artist, title);
    if (url) {
      // Save the good image_url back to Supabase immediately
      if (albumId) {
        await supabase
          .from('albums')
          .update({ image_url: url })
          .eq('id', albumId);
      }

      return url;
    }
  }
  console.warn(`All fallback attempts failed for ${artist} - ${title}`);
  return null;
}
