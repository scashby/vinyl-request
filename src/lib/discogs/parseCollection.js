// ✅ lib/discogs/parseCollection.js

import Papa from 'papaparse';

// ✅ Standardized format for internal use
const normalizeEntry = (entry) => {
  return {
    discogs_id: entry['Release ID'],
    artist: entry['Artist'],
    title: entry['Title'],
    label: entry['Label'],
    format: entry['Format'],
    year: entry['Released'],
    genre: entry['Genre'],
    notes: entry['Notes'] || '',
    folder_id: entry['Folder ID'],
    folder_name: entry['Folder'],
    added: entry['Date Added'],
    rating: entry['Rating'],
    resource_url: entry['Resource URL'],
    thumbnail: entry['Collection Folder Images'] || '',
  };
};

// ✅ Main function to parse CSV
export const parseDiscogsCSV = async (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const cleaned = results.data
            .filter((r) => r['Release ID']) // valid entries only
            .map(normalizeEntry);
          resolve(cleaned);
        } catch (err) {
          reject(err);
        }
      },
      error: reject,
    });
  });
};

// ✅ JSON variant if needed
export const parseDiscogsJSON = (jsonString) => {
  try {
    const raw = JSON.parse(jsonString);
    return raw.map(normalizeEntry);
  } catch (err) {
    throw new Error('Invalid JSON');
  }
};
