import { searchDiscogsRelease } from './discogs';
import { fetchAlbumArtFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID } from './musicbrainz';

export async function fetchAlbumCoverWithFallbacks(artist, title) {
  // 1. Try Discogs
  try {
    const result = await searchDiscogsRelease(artist, title);
    if (result?.thumb) {
      return result.thumb;
    }
  } catch (e) {
    console.warn(`Discogs fetch failed for ${artist} - ${title}`);
  }

  // 2. Try iTunes
  try {
    const itunesUrl = await fetchAlbumArtFromiTunes(artist, title);
    if (itunesUrl) {
      return itunesUrl;
    }
  } catch (e) {
    console.warn(`iTunes fetch failed for ${artist} - ${title}`);
  }

  // 3. Try MusicBrainz
  try {
    const mbData = await fetchAlbumFromMusicBrainz(artist, title);
    if (mbData?.id) {
      const mbCover = await fetchCoverArtFromMBID(mbData.id);
      if (mbCover) {
        return mbCover;
      }
    }
  } catch (e) {
    console.warn(`MusicBrainz fetch failed for ${artist} - ${title}`);
  }

  return null; // No fallback worked
}
