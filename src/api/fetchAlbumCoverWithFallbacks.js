import { searchDiscogsRelease } from './discogs';
import { fetchAlbumArtFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID } from './musicbrainz';

export async function fetchAlbumCoverWithFallbacks(artist, album) {
  try {
    // Try Discogs
    const discogsResult = await searchDiscogsRelease(artist, album);
    if (discogsResult) {
      console.log(`Fetched from Discogs: ${discogsResult}`);
      return discogsResult;
    }
  } catch (err) {
    console.error('Discogs search error:', err);
  }

  try {
    // Try iTunes
    const itunesResult = await fetchAlbumArtFromiTunes(artist, album);
    if (itunesResult) {
      console.log(`Fetched from iTunes: ${itunesResult}`);
      return itunesResult;
    }
  } catch (err) {
    console.error('iTunes API request failed:', err);
  }

  try {
    // Try MusicBrainz
    const mbRelease = await fetchAlbumFromMusicBrainz(artist, album);
    if (mbRelease) {
      const mbid = mbRelease.id;
      const mbCoverUrl = await fetchCoverArtFromMBID(mbid);
      if (mbCoverUrl) {
        console.log(`Fetched from MusicBrainz: ${mbCoverUrl}`);
        return mbCoverUrl;
      }
    }
  } catch (err) {
    console.error('Error fetching from MusicBrainz:', err);
  }

  console.warn(`All fallback attempts failed for ${artist} - ${album}`);
  return null;
}
