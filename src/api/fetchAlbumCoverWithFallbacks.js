import { searchDiscogsRelease } from './discogs';
import { fetchAlbumArtFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID } from './musicbrainz';

export const fetchAlbumCoverWithFallbacks = async (artist, title) => {
  // 1. Try Discogs
  try {
    const discogsResult = await searchDiscogsRelease(artist, title);
    if (discogsResult && discogsResult.cover_image) {
      return discogsResult.cover_image;
    }
  } catch (err) {
    console.warn(`Discogs fetch failed: ${err}`);
  }

  // 2. Try iTunes
  try {
    const itunesResult = await fetchAlbumArtFromiTunes(artist, title);
    if (itunesResult) {
      return itunesResult;
    }
  } catch (err) {
    console.warn(`iTunes fetch failed: ${err}`);
  }

  // 3. Try MusicBrainz
  try {
    const mbData = await fetchAlbumFromMusicBrainz(artist, title);
    if (mbData?.id) {
      const mbArt = await fetchCoverArtFromMBID(mbData.id);
      if (mbArt) {
        return mbArt;
      }
    }
  } catch (err) {
    console.warn(`MusicBrainz fetch failed: ${err}`);
  }

  return null;
};
