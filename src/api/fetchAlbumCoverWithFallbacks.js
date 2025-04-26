import { searchDiscogsRelease } from './discogs';
import { fetchAlbumArtFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID } from './musicbrainz';
import { supabase } from '../supabaseClient';

export async function fetchAlbumCoverWithFallbacks(artist, title, albumId) {
  try {
    // Try Discogs
    const discogsImageUrl = await searchDiscogsRelease(artist, title);
    if (discogsImageUrl) {
      return discogsImageUrl;
    }

    // Try iTunes
    const itunesImageUrl = await fetchAlbumArtFromiTunes(artist, title);
    if (itunesImageUrl) {
      return itunesImageUrl;
    }

    // Try MusicBrainz
    const mbAlbum = await fetchAlbumFromMusicBrainz(artist, title);
    if (mbAlbum && mbAlbum.mbid) {
      const mbCoverUrl = await fetchCoverArtFromMBID(mbAlbum.mbid);
      if (mbCoverUrl) {
        return mbCoverUrl;
      }
    }

    return null;
  } catch (error) {
    console.error('Error in fetchAlbumCoverWithFallbacks:', error);
    return null;
  }
}
