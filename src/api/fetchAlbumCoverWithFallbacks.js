// src/api/fetchAlbumCoverWithFallbacks.js

import { fetchAlbumArtFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID } from './musicbrainz';
import { supabase } from '../supabaseClient';
import { formatDiscogsTracklist } from './discogs';

// MAIN FUNCTION
export async function fetchAlbumCoverWithFallbacks(artist, title, albumId) {
  console.log(`Starting album art search for: Artist = "${artist}", Title = "${title}"`);

  const fallbackSources = [fetchFromDiscogs, fetchFromItunes, fetchFromMusicbrainz];

  for (const fetchSource of fallbackSources) {
    try {
      const url = await fetchSource(artist, title, albumId);
      if (url) {
        console.log(`Found album art URL from source: ${fetchSource.name} ➔ ${url}`);
        return url; // Return the real URL
      } else {
        console.log(`No image found from source: ${fetchSource.name}`);
      }
    } catch (error) {
      console.error(`Error trying ${fetchSource.name} for`, artist, title, error);
    }
  }

  console.log(`No album art found for: "${artist}" - "${title}" from any source.`);
  return null;
}

// DISCOSGS Fallback using Proxy
async function fetchFromDiscogs(artist, title, albumId) {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const apiUrl = `https://api.discogs.com/database/search?q=${query}&type=release&per_page=1`;

    const response = await fetch(`/api/proxyFetch?url=${encodeURIComponent(apiUrl)}`);
    if (!response.ok) {
      throw new Error(`Proxy fetch failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const first = data.results[0];

      if (albumId) {
        const updates = {};

        if (first.cover_image) {
          updates.image_url = first.cover_image;
        }

        if (first.tracklist) {
          updates.sides = formatDiscogsTracklist(first.tracklist);
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('collection')
            .update(updates)
            .eq('id', albumId);
        }
      }

      if (first.cover_image) {
        console.log(`Found Discogs cover image: ${first.cover_image}`);
        return first.cover_image;
      }
    }
  } catch (err) {
    console.error('Discogs proxy fetch error:', err);
  }
  return null;
}

// ITUNES fallback (also via proxy)
async function fetchFromItunes(artist, title) {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const url = `/api/proxyFetch?url=${encodeURIComponent(`https://itunes.apple.com/search?term=${query}&entity=album&limit=1`)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`iTunes proxy fetch failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
    }
  } catch (error) {
    console.error('iTunes proxy fetch error:', error);
  }
  return null;
}

// MUSICBRAINZ fallback (also via proxy)
async function fetchFromMusicbrainz(artist, title) {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const url = `/api/proxyFetch?url=${encodeURIComponent(`https://musicbrainz.org/ws/2/release/?query=artist:${artist}%20AND%20release:${title}&fmt=json`)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MusicBrainz proxy fetch failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (data.releases && data.releases.length > 0) {
      const release = data.releases[0];
      const coverArtUrl = `https://coverartarchive.org/release/${release.id}/front`; // No need to proxy this simple GET
      return coverArtUrl;
    }
  } catch (error) {
    console.error('MusicBrainz proxy fetch error:', error);
  }
  return null;
}