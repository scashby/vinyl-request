// ===== fetchAlbumCoverWithFallbacks.js =====

import { supabase } from '../supabaseClient';
import { searchDiscogsRelease, getDiscogsTracklist } from './discogs';
import { fetchAlbumArtFromiTunes, fetchTracksFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID, fetchTracksFromMusicBrainz } from './musicbrainz';

// ===== Helper: Parse Raw Tracklist to Sides =====
function parseTracklistToSides(tracks) {
  const sides = {};
  tracks.forEach((track) => {
    const match = track.match(/^(A|B|C|D|E|F)(\d+)\s+(.*)/);
    if (match) {
      const side = match[1];
      const title = match[3];
      if (!sides[side]) sides[side] = [];
      sides[side].push(title.trim());
    } else {
      if (!sides['A']) sides['A'] = [];
      sides['A'].push(track.trim());
    }
  });
  return sides;
}

// ===== MAIN FUNCTION =====
export async function fetchAlbumCoverWithFallbacks(artist, title, albumId) {
  let coverUrl = null;
  let tracklist = null;

  // ----- Try Discogs First -----
  try {
    const discogsData = await searchDiscogsRelease(artist, title);
    if (discogsData?.coverImage) {
      coverUrl = discogsData.coverImage;
    }
    if (discogsData?.tracklist?.length > 0) {
      tracklist = discogsData.tracklist.map(t => t.title);
    }
  } catch (err) {
    console.error('Discogs lookup failed:', err);
  }

  // ----- If Missing, Try iTunes -----
  if (!coverUrl || !tracklist) {
    try {
      if (!coverUrl) {
        coverUrl = await fetchAlbumArtFromiTunes(artist, title);
      }
      if (!tracklist) {
        tracklist = await fetchTracksFromiTunes(artist, title);
      }
    } catch (err) {
      console.error('iTunes fallback failed:', err);
    }
  }

  // ----- If Still Missing, Try MusicBrainz -----
  if (!coverUrl || !tracklist) {
    try {
      const mbid = await fetchAlbumFromMusicBrainz(artist, title);
      if (mbid) {
        if (!coverUrl) {
          coverUrl = await fetchCoverArtFromMBID(mbid);
        }
        if (!tracklist) {
          tracklist = await fetchTracksFromMusicBrainz(mbid);
        }
      }
    } catch (err) {
      console.error('MusicBrainz fallback failed:', err);
    }
  }

  // ----- Save Results to Supabase -----
  if (albumId) {
    const updates = {};

    if (coverUrl) {
      updates.image_url = coverUrl;
    } else {
      updates.image_url = 'no';
    }

    if (tracklist && tracklist.length > 0) {
      updates.sides = parseTracklistToSides(tracklist);
    }

    try {
      const { error } = await supabase.from('collection').update(updates).eq('id', albumId);
      if (error) {
        console.error('Error updating Supabase with album art and tracks:', error);
      } else {
        console.log('Updated album in Supabase:', artist, title);
      }
    } catch (err) {
      console.error('Supabase update error:', err);
    }
  }

  return coverUrl || null;
}
