// src/api/fetchAlbumCoverWithFallbacks.js

import { searchDiscogsRelease } from './discogs';
import { fetchAlbumArtFromiTunes } from './itunes';
import { fetchAlbumFromMusicBrainz, fetchCoverArtFromMBID } from './musicbrainz';
import { supabase } from '../supabaseClient';

export async function fetchAlbumCoverWithFallbacks(artist, title, albumId) {
  try {
    console.log(`Fetching album cover for ${artist} - ${title}`);

    // 1. Try Discogs
    const discogsResult = await searchDiscogsRelease(artist, title);
    if (discogsResult && typeof discogsResult === 'string' && discogsResult.trim() !== '') {
      console.log('Found album cover from Discogs:', discogsResult);
      await updateSupabaseImage(albumId, discogsResult, artist, title);
      return discogsResult;
    }

    // 2. Try iTunes
    const itunesResult = await fetchAlbumArtFromiTunes(artist, title);
    if (itunesResult && typeof itunesResult === 'string' && itunesResult.trim() !== '') {
      console.log('Found album cover from iTunes:', itunesResult);
      await updateSupabaseImage(albumId, itunesResult, artist, title);
      return itunesResult;
    }

    // 3. Try MusicBrainz
    const mbid = await fetchAlbumFromMusicBrainz(artist, title);
    if (mbid) {
      const mbResult = await fetchCoverArtFromMBID(mbid);
      if (mbResult && typeof mbResult === 'string' && mbResult.trim() !== '') {
        console.log('Found album cover from MusicBrainz:', mbResult);
        await updateSupabaseImage(albumId, mbResult, artist, title);
        return mbResult;
      }
    }

    // 4. Nothing found
    console.warn(`No valid image found for ${artist} - ${title}. Marking as 'no' in Supabase.`);
    await updateSupabaseImage(albumId, 'no', artist, title);
    return null;

  } catch (error) {
    console.error(`Error fetching album cover for ${artist} - ${title}:`, error);
    await updateSupabaseImage(albumId, 'no', artist, title);
    return null;
  }
}

async function updateSupabaseImage(albumId, imageUrl, artist, title) {
  const { error } = await supabase
    .from('collection')
    .update({ image_url: imageUrl })
    .eq('id', albumId);

  if (error) {
    console.error(`Failed to update Supabase for ${artist} - ${title}:`, error);
  } else {
    console.log(`Successfully updated Supabase for ${artist} - ${title} with image_url = ${imageUrl}`);
  }
}
