# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### 0.1.1 (2025-05-26)

# Vinyl Request App - Changelog

---

## 2025-04-22

### ✅ Initial Setup
- Created Vinyl Request App project using Create React App.
- Set up Supabase database with `collection`, `requests`, and `events` tables.
- Confirmed RLS (Row Level Security) OFF for public reading access.

---

## 2025-04-23

### ✅ Supabase Environment Setup
- Added `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` environment variables locally and in Vercel.
- Verified initial connection between React app and Supabase database.

---

## 2025-04-24

### ✅ First Successful Album Fetch
- Albums successfully fetched and displayed from Supabase `collection` table.
- Album grid layout (`album-grid`) confirmed working visually.
- Search and filter functionality added (filtering by album title, artist, and media type folder).

---

## 2025-04-25

### ✅ Album Card Expansion Planning
- Planned feature to expand album cards to allow selecting sides (A-F) and submitting request forms.
- Added code to fetch `sides` alongside album art (initial attempt).

---

## 2025-04-26

### ⚠️ Breakage: Sides Fetch Attempt
- Fetching sides data introduced bugs.
- Some albums lacked sides, causing broken data and grid failure.
- **Resolution planned**: Rework sides handling after restoring basic grid.

---

## 2025-04-27

### ✅ Supabase Connection Hardening
- Switched Supabase credentials from env variables to **hardcoded** keys temporarily to stabilize production deployment.

---

## 2025-04-27

### ⚠️ Grid Display Broken
- After fallback cover fetching was expanded (Discogs/iTunes), album rendering broke.
- Discogs fetch began failing with 401 Unauthorized (token expired).
- Fallback covers failed due to missing tokens and CORS — not fatal to album fetch itself.

---

## 2025-04-28

### ✅ Root Cause Identified: Rendering / CSS Problem
- Confirmed that albums were fetched into memory successfully.
- Confirmed that filtering logic was working (not filtering all albums out).
- Identified that `.album-grid` structure existed but album-cards were missing/invisible due to broken mapping and missing fallback handling.

---

## 2025-04-28

### ✅ Grid Restored
- Reverted `BrowseAlbums.js` to the last working backup version.
- Restored full album-grid and album-card structure.
- Ensured albums render even when covers are missing, with black fallback placeholders.
- Grid now displays correctly.

---

## 2025-04-29

### ✅ FilterBar Fixes and Filtering Logic Debugging
- Fixed broken media type filtering in `BrowseAlbums.js`.
- Identified that `FilterBar` was passing lowercase media types (`vinyl`, `cassette`, `45`) while `folder` values in Supabase were capitalized (`Vinyl`, `Cassette`, `45s`).
- Corrected comparison in `useEffect` to normalize casing: `album.folder?.toLowerCase() === mediaType.toLowerCase()`.
- Added debug logging to confirm album data and filter results.
- Confirmed `Vinyl` filter working; identified and resolved additional string mismatch with `Cassette` (was incorrectly singular in filter logic).
- Corrected `FilterBar.js` to pass exact values: `"Vinyl"`, `"Cassette"`, `"45s"`, `"All"`.

### ✅ Shell Alias Management for Git Workflow
- Confirmed `pushit` and `pullit` are shell aliases defined in `.bashrc`.
- Created persistent aliases:
  - `pushit`: commits and pushes to `origin/main` with a custom message.
  - `pushit-working`: also creates a timestamped Git tag like `working-20250429-1532` and pushes it.
  - `pullit-working`: fetches and checks out the latest `working-*` tag from GitHub.
- Added all aliases to `~/.bashrc` with `source ~/.bashrc` to persist across sessions.

---

## 2025-04-30

### ✅ Request Queue Functionality Fixes
- Fixed duplicate votes issue in request submission process.
- Updated RequestQueue component to correctly fetch album artwork from Supabase collection table.
- Created dedicated ExpandableRequestAlbumCard component for view-only album details.
- Improved request display in queue with proper formatting.
- Fixed BrowseAlbums component to prevent duplicate processing of album requests.

### ✅ UI/UX Improvements
- Added clear visual indication of which side was requested in ExpandableRequestAlbumCard.
- Improved display of requester information to handle multiple requesters.
- Enhanced Request Queue with cleaner layout for improved readability.

---

# ✅ Status as of 2025-04-30

- Album browsing fully restored and filtered by artist, title, and folder (Vinyl, Cassette, 45s).
- Search bar and filter bar both working as intended.
- Album grid renders even without image assets using fallback placeholders.
- Request Queue displays correctly with album artwork from Supabase.
- Fixed request duplication issue that was causing double votes.
- Improved album detail view for requested tracks.
- Git workflow improved with custom aliases and version tagging.

---

# 📋 Next Steps (planned)

- Import tracklists from outside sources like Discogs API or MusicBrainz to populate album side information.
- Reintroduce track side selection (A–F) with proper data fetching and error handling.
- Add support for customer vinyl override queue entries with admin mode.
- Replace expired Discogs token or switch to alternate metadata source.
- Begin editable tracklist integration for album sides and request form context.

### Added
- Created `src/admin/ImportDiscogs.js`: A new admin UI page to import and sync your Discogs collection.
- Added React Router route at `/admin/import-discogs` via `App.js`.
- Updated `AdminPanel.js` menu with link to the import tool.
- Implemented `parseDiscogsCSV` in `src/lib/discogs/parseCollection.js` to normalize CSV exports.
- Built `enrichDiscogsRelease` in `src/lib/discogs/enrichRelease.js` to fetch album art and track listings from the Discogs API, with fallback support.
- Added `syncDiscogsToSupabase` in `src/lib/discogs/syncToSupabase.js` to upsert new or changed records into Supabase.
- Standardized Discogs token and Supabase config using `src/lib/constants.js`.

### Notes
- This feature enables fully automated cleanup and enrichment of your collection from Discogs, with minimal manual review.
- Route is accessible via `/admin/import-discogs`.
