import { searchDiscogsRelease } from './discogs';
import { fetchAlbumArtFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID } from './musicbrainz';
import { supabase } from '../supabaseClient';

// MAIN FUNCTION
export async function fetchAlbumCoverWithFallbacks(artist, title, albumId) {
  console.log(`Starting album art search for: Artist = "${artist}", Title = "${title}"`);
  
  const fallbackSources = [fetchFromDiscogs, fetchFromItunes, fetchFromMusicbrainz];

  for (const fetchSource of fallbackSources) {
    try {
      const url = await fetchSource(artist, title, albumId);
      if (url && url !== 'no') {
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
  return null; // Explicitly return null if no image found
}



// --- FETCHERS ---

async function fetchFromDiscogs(artist, title, albumId) {
  try {
    const results = await searchDiscogsRelease(artist, title);

    if (results && results.length > 0) {
      const first = results[0];

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
    console.error('Discogs fetch error:', err);
  }
  return null;
}


async function fetchFromItunes(artist, title, albumId) {
  try {
    const proxyUrl = `/api/proxyFetch?url=${encodeURIComponent(`https://itunes.apple.com/search?term=${artist} ${title}&entity=album&limit=1`)}`;
    let url = null;
    try {
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        console.error('iTunes proxy fetch failed:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      console.log('iTunes proxy fetch successful:', data);

      url = data.results && data.results[0] ? data.results[0].artworkUrl100.replace('100x100bb', '600x600bb') : null;
    } catch (err) {
      console.error('iTunes proxy fetch error:', err);
      return null;
    }

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
    const proxyUrl = `/api/proxyFetch?url=${encodeURIComponent(`https://musicbrainz.org/ws/2/release/?query=${artist} ${title}&fmt=json&limit=1`)}`;
    let mbid = null;
    try {
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        console.error('Musicbrainz proxy fetch failed:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      console.log('Musicbrainz proxy fetch successful:', data);

      mbid = data.releases && data.releases[0] ? data.releases[0].id : null;
    } catch (err) {
      console.error('Musicbrainz proxy fetch error:', err);
      return null;
    }

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