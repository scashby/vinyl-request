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
  