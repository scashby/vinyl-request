import { searchDiscogsRelease } from './discogs';
import { fetchAlbumArtFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID } from './musicbrainz';

export async function fetchAlbumCoverWithFallbacks(artist, title) {
  // Try Discogs first
  try {
    const discogsResult = await searchDiscogsRelease(artist, title);
    if (discogsResult && discogsResult.cover_image) {
      console.log(`Fetched from Discogs: ${discogsResult.cover_image}`);
      return discogsResult.cover_image;
    }
  } catch (error) {
    console.warn(`Discogs fetch failed for ${artist} - ${title}:`, error.message);
  }

  // Then try iTunes
  try {
    const itunesResult = await fetchAlbumArtFromiTunes(artist, title);
    if (itunesResult) {
      console.log(`Fetched from iTunes: ${itunesResult}`);
      return itunesResult;
    }
  } catch (error) {
    console.warn(`iTunes fetch failed for ${artist} - ${title}:`, error.message);
  }

  // Then try MusicBrainz
  try {
    const musicbrainzResult = await fetchAlbumFromMusicBrainz(artist, title);
    if (musicbrainzResult && musicbrainzResult.id) {
      const coverArtUrl = await fetchCoverArtFromMBID(musicbrainzResult.id);
      if (coverArtUrl) {
        console.log(`Fetched from MusicBrainz: ${coverArtUrl}`);
        return coverArtUrl;
      }
    }
  } catch (error) {
    console.warn(`MusicBrainz fetch failed for ${artist} - ${title}:`, error.message);
  }

  // If all fail
  console.warn(`All fallback attempts failed for ${artist} - ${title}`);
  return null;
}
