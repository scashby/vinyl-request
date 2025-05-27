// src/api/itunes.js

export async function fetchAlbumArtFromiTunes(artist, album) {
    const searchTerm = encodeURIComponent(`${artist} ${album}`);
    const url = `https://itunes.apple.com/search?term=${searchTerm}&entity=album&limit=1`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        console.error(`iTunes API request failed: ${response.status}`);
        return null;
      }
  
      const data = await response.json();
  
      if (data.results && data.results.length > 0) {
        const albumArtUrl = data.results[0].artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
        return albumArtUrl;
      } else {
        console.warn(`No album art found on iTunes for ${artist} - ${album}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching from iTunes API:`, error);
      return null;
    }
  }
 // Fetch Tracks From iTunes (dummy fallback version)
export async function fetchTracksFromiTunes(artist, title) {
  try {
    const searchTerm = encodeURIComponent(`${artist} ${title}`);
    const response = await fetch(`https://itunes.apple.com/search?term=${searchTerm}&entity=song&limit=50`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn(`No tracks found from iTunes for ${artist} - ${title}`);
      return null;
    }

    // iTunes does not organize by side, so we just return a flat array
    const tracks = data.results.map(track => track.trackName);

    if (tracks.length === 0) return null;

    // Group into pseudo-sides: A, B, C if >20 songs
    const sides = {};
    const chunkSize = 8; // Just to avoid huge sides
    for (let i = 0; i < tracks.length; i += chunkSize) {
      const sideLetter = String.fromCharCode(65 + (i / chunkSize)); // A, B, C...
      sides[sideLetter] = tracks.slice(i, i + chunkSize);
    }

    return sides;
  } catch (error) {
    console.error('Error fetching tracks from iTunes:', error);
    return null;
  }
}
 // ===== iTunes API Functions =====

// (Already working album art fetching here — LEAVE INTACT)


