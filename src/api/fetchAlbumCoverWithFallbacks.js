import { searchDiscogsRelease } from './discogs';
import { fetchAlbumArtFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID } from './musicbrainz';
import { supabase } from '../supabaseClient';

export async function fetchAlbumCoverWithFallbacks(artist, title, albumId) {
  const fallbackSources = [fetchFromDiscogs, fetchFromItunes, fetchFromMusicbrainz];

  for (const fetchSource of fallbackSources) {
    const url = await fetchSource(artist, title, albumId);
    if (url) {
      return url;
    }
  }
  return null;
}

// --- FETCHERS ---

async function fetchFromDiscogs(artist, title, albumId) {
  try {
    const results = await searchDiscogsRelease(artist, title);
    if (results && results.length > 0) {
      const first = results[0];
      
      if (first.cover_image && albumId) {
        await supabase
          .from('collection')
          .update({ image_url: first.cover_image })
          .eq('id', albumId);
      }

      if (first.tracklist && albumId) {
        const sides = formatDiscogsTracklist(first.tracklist);
        await supabase
          .from('collection')
          .update({ sides })
          .eq('id', albumId);
      }

      return first.cover_image || null;
    }
  } catch (err) {
    console.error('Discogs fetch error:', err);
  }
  return null;
}

async function fetchFromItunes(artist, title, albumId) {
  try {
    const url = await fetchAlbumArtFromiTunes(artist, title);
    if (url && albumId) {
      await supabase
        .from('collection')
        .update({ image_url: url })
        .eq('id', albumId);
    }
    return url;
  } catch (err) {
    console.error('iTunes fetch error:', err);
  }
  return null;
}

async function fetchFromMusicbrainz(artist, title, albumId) {
  try {
    const mbid = await fetchAlbumFromMusicBrainz(artist, title);
    if (mbid) {
      const url = await fetchCoverArtFromMBID(mbid);
      if (url && albumId) {
        await supabase
          .from('collection')
          .update({ image_url: url })
          .eq('id', albumId);
      }
      return url;
    }
  } catch (err) {
    console.error('MusicBrainz fetch error:', err);
  }
  return null;
}

// --- HELPERS ---

function formatDiscogsTracklist(tracklist) {
  const sides = {};

  for (const track of tracklist) {
    if (!track.position) continue;

    const match = track.position.match(/^([A-F])(\d+)$/i);
    if (match) {
      const side = match[1].toUpperCase();
      if (!sides[side]) {
        sides[side] = [];
      }
      sides[side].push(track.title);
    }
  }

  return sides;
}
