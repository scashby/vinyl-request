import { searchDiscogsRelease } from './discogs';
import { fetchAlbumArtFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID } from './musicbrainz';

export async function fetchAlbumCoverWithFallbacks(artist, album) {
  try {
    const discogsResults = await searchDiscogsRelease(artist, album);
    if (discogsResults && discogsResults.length > 0) {
      const firstResult = discogsResults[0];
      if (firstResult.cover_image) {
        console.log(`Fetched Discogs art: ${firstResult.cover_image}`);
        return firstResult.cover_image;
      }
    }
  } catch (err) {
    console.error('Discogs search error:', err);
  }
  
  try {
    const itunesUrl = await fetchAlbumArtFromiTunes(artist, album);
    if (itunesUrl) {
      console.log(`Fetched iTunes art: ${itunesUrl}`);
      return itunesUrl;
    }
  } catch (err) {
    console.error('iTunes fetch error:', err);
  }
  

  try {
    const mbUrl = await fetchCoverArtFromMBID(artist, album);
    if (mbUrl) {
      console.log(`Fetched MusicBrainz art: ${mbUrl}`);
      return mbUrl;
    }
  } catch (err) {
    console.error('MusicBrainz fetch error:', err);
  }
  

  console.warn(`All fallback attempts failed for ${artist} - ${album}`);
  return null;
}
