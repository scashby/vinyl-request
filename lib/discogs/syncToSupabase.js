// ✅ lib/discogs/syncToSupabase.js

import { createClient } from '@supabase/supabase-js';
import { enrichDiscogsRelease } from './enrichRelease';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ Compare and sync entries
export async function syncDiscogsToSupabase(parsedEntries) {
  const updates = [];

  for (const entry of parsedEntries) {
    const { data: existing, error } = await supabase
      .from('albums')
      .select('*')
      .eq('discogs_id', entry.discogs_id)
      .single();

    // Enrich with tracklist and album art
    const enrichment = await enrichDiscogsRelease(entry.discogs_id);

    const combined = {
      ...entry,
      album_art: enrichment.albumArt,
      tracklist: enrichment.tracklist,
      genres: enrichment.genres,
      styles: enrichment.styles,
    };

    // Check if new or updated
    const isNew = !existing;
    const hasChanged = existing && (
      existing.artist !== combined.artist ||
      existing.title !== combined.title ||
      existing.tracklist !== JSON.stringify(combined.tracklist)
    );

    if (isNew || hasChanged) {
      updates.push(combined);
    }
  }

  // ✅ Batch upsert
  if (updates.length > 0) {
    const { data, error } = await supabase
      .from('albums')
      .upsert(updates, { onConflict: ['discogs_id'] });

    if (error) throw error;
    return { updated: updates.length, data };
  }

  return { updated: 0, data: [] };
}
