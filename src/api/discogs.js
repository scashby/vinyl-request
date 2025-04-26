// src/api/discogs.js

const DISCOGS_TOKEN = 'UcVUWNMdndGIWKlOpPpCmswqSXezjjzjDIMzTISo';
const BASE_URL = 'https://api.discogs.com';

export async function searchDiscogsRelease(artist, title) {
  const query = encodeURIComponent(`${artist} ${title}`);
  const url = `${BASE_URL}/database/search?q=${query}&token=${DISCOGS_TOKEN}&type=release`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Discogs search error:', error);
    return [];
  }
}

export async function getDiscogsRelease(releaseId) {
  const url = `${BASE_URL}/releases/${releaseId}?token=${DISCOGS_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Discogs release fetch error:', error);
    return null;
  }
}
export function formatDiscogsTracklist(tracklist) {
  if (!tracklist || tracklist.length === 0) {
    return [];
  }

  const sides = {};
  let currentSide = 'A'; // Start with Side A

  for (const track of tracklist) {
    // Discogs sometimes includes headings like 'Side A', 'Side B', etc.
    if (track.type_ === 'heading' && track.title.match(/side\s+[a-z]/i)) {
      currentSide = track.title.trim().split(/\s+/).pop().toUpperCase();
    } else if (track.type_ === 'track') {
      if (!sides[currentSide]) {
        sides[currentSide] = [];
      }
      sides[currentSide].push(track.title);
    }
  }

  return sides;
}
