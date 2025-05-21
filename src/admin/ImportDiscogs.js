// ✅ src/admin/ImportDiscogs.js

import React, { useState } from 'react';
import { parseDiscogsCSV } from '../lib/discogs/parseCollection';
import { syncDiscogsToSupabase } from '../lib/discogs/syncToSupabase';

export default function ImportDiscogs() {
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a valid Discogs CSV export file.');
      return;
    }

    setError('');
    setStatus('Parsing Discogs file...');
    setProgress(null);

    try {
      const parsed = await parseDiscogsCSV(file);
      setStatus(`Parsed ${parsed.length} records. Syncing to Supabase...`);

      const result = await syncDiscogsToSupabase(parsed);
      setProgress(result);
      setStatus(`Sync complete. ${result.updated} record(s) added or updated.`);
    } catch (err) {
      console.error(err);
      setError(`Import failed: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>Import Discogs Collection</h1>
      <p>Upload your latest Discogs collection CSV export.</p>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {status && <p><strong>Status:</strong> {status}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {progress && (
        <div style={{ marginTop: '1rem' }}>
          <p><strong>Updated:</strong> {progress.updated}</p>
        </div>
      )}
    </div>
  );
}
