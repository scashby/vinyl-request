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

# ✅ Status as of 2025-04-29

- Album browsing fully restored and filtered by artist, title, and folder (Vinyl, Cassette, 45s).
- Search bar and filter bar both working as intended.
- Album grid renders even without image assets using fallback placeholders.
- Git workflow improved with custom aliases and version tagging.

---

# 📋 Next Steps (planned)

- Reintroduce track side selection (A–F) from external source with Discogs fallback.
- Add support for customer vinyl override queue entries with admin mode.
- Replace expired Discogs token or switch to alternate metadata source.
- Begin editable tracklist integration for album sides and request form context.
