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

# ✅ Status as of 2025-04-28

- Basic album browsing working.
- Search and filter working.
- Album grid visually restored.
- No current crash or fatal errors.

---

# 📋 Next Steps (planned)

- Reintroduce sides (track lists) carefully after grid stability confirmed.
- Replace broken Discogs API token or adjust fallback strategy.
- Implement graceful error handling for fallback cover fetching.

---
