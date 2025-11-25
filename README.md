# OMDB Movie Explorer

OMDB Movie Explorer is a small example web application that lets users search for movies (via the OMDB API), view details, and manage a list of favorite movies. The project is split into a backend (an OMDB proxy + cache + trending/metrics endpoints) and a React frontend (Vite) UI.

**Status:** Development

**Table of contents**
- Project Overview
- Features
- Tech stack
- Architecture
- Getting started
  - Prerequisites
  - Environment variables
  - Installing dependencies
  - Running locally
- API (backend) overview
- Frontend details
  - Local storage keys and events
- Deployment
- Contributing
- License

**Project Overview**
- Backend: a Node/Express service that proxies OMDB API calls, caches results (in-memory LRU cache), records view metrics and exposes aggregated "trending" endpoints.
- Frontend: React app (Vite) that provides search, movie details, favorites management, and a compact UI for trending and results.

**Features**
- Search movies via OMDB (server-side API key)
- Voice search: Search movies using your microphone for hands-free interaction
- Movie detail view: Displays plot, actors, director, and ratings; records view metrics
- Favorites management: add/remove favorites; favorites persisted in localStorage
- Sorting options: Sort favorites by year, rating, or alphabetical order
- Centered alert for add/remove favorite actions
- Trending movies on main page: Displays top-rated movies dynamically
- Backend batch endpoint to fetch many movie details in one request (`POST /api/movie/batch`)
- Trending endpoints aggregated by views and ratings for different time ranges
- Simple in-memory caching with TTL exposed for debugging

## Screenshots

Home / Search Page  
![Home](screenshots/mainpage.png)

Result Grid  
![Movie Result Grid](screenshots/moviesResult.png)

Movie Details Page 
![Details](screenshots/movieDetails.png)

Favorites  
![Favorites](screenshots/favorites.png)


**Tech stack**
- Backend: Node.js, Express, axios
- Frontend: React, Vite
- Local development: npm

**Architecture**
- The backend contains routes for movie details, batch movie fetch, metrics recording, and trending aggregation.
- The frontend communicates with the backend for details and trending results and stores lightweight state in `localStorage` for favorites and cached movie objects.

Getting started
---------------

Prerequisites
- Node.js (16+ recommended)
- npm

Environment variables
- Backend expects an OMDB API key in an environment variable. Create a `.env` file in `backend/` or set `OMDB_API_KEY` in your shell.
  - `OMDB_API_KEY=your_api_key_here`

Install dependencies
- Backend:
```powershell
cd backend
npm install
```
- Frontend:
```powershell
cd frontend
npm install
```

Running locally (development)
- Start the backend (from `backend`):
```powershell
cd backend
npm run dev
```
- Start the frontend (from `frontend`):
```powershell
cd frontend
npm run dev
```
- Open the frontend URL shown by Vite (usually `http://localhost:5173`) and use the app.

Building for production
- Build frontend:
```powershell
cd frontend
npm run build
```
- Build/prepare backend as required (no build step for simple Node server), configure environment variables and serve with a process manager.

API (backend) overview
- `GET /api/movie/:id` — fetch movie details by `imdbID` (proxied from OMDB)
- `POST /api/movie/batch` — body `{ ids: ['tt...','tt...'] }` returns array of movie objects (or error entries) for the provided IDs
- `POST /api/metrics/view` — body `{ imdbID: 'tt...' }` increments today's view counter for the movie (used by trending)
- `GET /api/search/trending?mode=<mode>` — returns trending/top lists. Modes include default (Top Rated seeded), `weeklyViews`, `monthlyRating`, `yearlyRating` (implementation details in backend routes)

Frontend details
- Main folders
  - `frontend/src/components` — React components (MovieCard, MovieDetail, Favorites, CenteredAlert, etc.)
  - `frontend/src` — app entrypoints (App.jsx, styles)

- localStorage keys used by the frontend
  - `favs` — array of favorite `imdbID` strings
  - `moviesById` — object mapping `imdbID` → movie object (cached locally for favorites and quick lookup)
  - `allMovies` — last search/trending list persisted
  - `favSort` — user's favorite sorting preference

- Custom DOM events used
  - `favsUpdated` — dispatched when favorites change to notify components to re-read `localStorage` and update UI
  - `center-alert` — dispatched with `{ detail: { message, timeout } }` to show a centered, modal-like non-blocking alert in the UI

Notes about UI behavior
- Favorites actions use `localStorage` and dispatch `favsUpdated` so multiple components stay in sync.
- The centered alert is rendered into `document.body` (portal) to avoid stacking context/clipping issues.

Debugging tips
- If centered overlays or modals appear clipped or off-center, inspect the DOM to confirm the overlay is mounted as a child of `<body>`.
- Check for elements with `transform`, `filter`, or `perspective` CSS on parent containers — these can create stacking/containment contexts that affect fixed/absolute elements.
License
- This project does not include an explicit license file. Add a LICENSE if you intend to open-source it.

Contact / Credits
- Built as an example project using the OMDB API.

---
