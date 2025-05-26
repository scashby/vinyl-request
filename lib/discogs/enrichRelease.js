// ✅ lib/discogs/enrichRelease.js

import { fetchWithRetry } from '../utils/fetchWithRetry';
import { DISCOGS_API_TOKEN } from '../constants';

// ✅ Normalize tracklist into Side A/B/etc.
const groupTracksBySide = (tracklist) => {
  const grouped = {};
  for (const track of tracklist) {
    const position = track.position || '';
    const side = /^[A-D]/i.test(position) ? position[0].toUpperCase() : 'A';
    if (!grouped[side]) grouped[side] = [];
    grouped[side].push(track.title || '');
  }
  return grouped;
};

// ✅ Primary function to enrich one Discogs release
export async function enrichDiscogsRelease(discogs_id) {
  const endpoint = `https://api.discogs.com/releases/${discogs_id}?token=${KVVAFUlIzOPCUFNhtVXZJenwBHhGmFrmkwYgzQXD}`;

  try {
    const data = await fetchWithRetry(endpoint, { method: 'GET' });

    const albumArt = data.images?.[0]?.uri || '';
    const tracklist = groupTracksBySide(data.tracklist || []);
    const genres = data.genres || [];
    const styles = data.styles || [];

    return {
      albumArt,
      tracklist,
      genres,
      styles,
      fetchedFrom: 'Discogs',
    };
  } catch (err) {
    console.warn(`Discogs fetch failed for ID ${discogs_id}.`, err);
    return {
      albumArt: '',
      tracklist: {},
      genres: [],
      styles: [],
      fetchedFrom: 'Fallback',
    };
  }
}
