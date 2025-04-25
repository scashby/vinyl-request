// src/api/musicbrainz.js

// Function to fetch album info from MusicBrainz
export async function fetchAlbumFromMusicBrainz(artist, album) {
    const query = `artist:${artist} AND release:${album}`;
    const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=1`;
  
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch from MusicBrainz');
      }
  
      const data = await response.json();
      if (data.releases && data.releases.length > 0) {
        const release = data.releases[0];
        return {
          mbid: release.id,
          title: release.title,
          date: release.date,
          country: release.country
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching from MusicBrainz:', error);
      return null;
    }
  }
  
  // Function to fetch cover art from Cover Art Archive using MusicBrainz ID
  export async function fetchCoverArtFromMBID(mbid) {
    const url = `https://coverartarchive.org/release/${mbid}/front-500`;
  
    try {
      const response = await fetch(url);
  
      if (response.ok) {
        return response.url; // Returns the direct image URL
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching cover art from Cover Art Archive:', error);
      return null;
    }
  }
  