import React, { useEffect, useState, useCallback, useMemo } from 'react';

export default function Favorites({ onSelect }) {
  const initialise = () => {
    const favIDs = JSON.parse(localStorage.getItem('favs') || '[]');
    const moviesById = JSON.parse(localStorage.getItem('moviesById') || '{}');
    const allMovies = JSON.parse(localStorage.getItem('allMovies') || '[]');

    const favorites = favIDs.map(id => {
      if (moviesById && moviesById[id]) return moviesById[id];
      return allMovies.find(movie => movie.imdbID === id);
    }).filter(Boolean);

    const missing = favIDs.filter(id => {
      return !(moviesById && moviesById[id]) && !allMovies.find(m => m.imdbID === id);
    });

    return { favorites, missing };
  };

  const init = useMemo(() => initialise(), []);
  const [favMovies, setFavMovies] = useState(() => init.favorites);
  const [sortMethod, setSortMethod] = useState(() => {
    return localStorage.getItem('favSort') || 'default';
  });

  const sortFavorites = (list, method) => {
    if (!list || list.length === 0) return list;
    const copy = [...list];
    const parseYear = (y) => {
      if (!y) return 0;
      const m = String(y).match(/\d{4}/);
      return m ? parseInt(m[0], 10) : 0;
    };
    const parseRating = (r) => {
      const n = parseFloat(r);
      return Number.isFinite(n) ? n : 0;
    };

    switch (method) {
      case 'year-asc':
        copy.sort((a, b) => parseYear(a.Year) - parseYear(b.Year));
        break;
      case 'year-desc':
        copy.sort((a, b) => parseYear(b.Year) - parseYear(a.Year));
        break;
      case 'title-asc':
        copy.sort((a, b) => String(a.Title).localeCompare(String(b.Title)));
        break;
      case 'title-desc':
        copy.sort((a, b) => String(b.Title).localeCompare(String(a.Title)));
        break;
      case 'rating-asc':
        copy.sort((a, b) => parseRating(a.imdbRating) - parseRating(b.imdbRating));
        break;
      case 'rating-desc':
        copy.sort((a, b) => parseRating(b.imdbRating) - parseRating(a.imdbRating));
        break;
      case 'default':
      default:
  
        break;
    }

    return copy;
  };

  const fetchMissing = useCallback(async (ids) => {
    if (!ids || ids.length === 0) return;

    try {
      const res = await fetch('/api/movie/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) {
        console.warn('Batch fetch failed', res.status);
        return;
      }

      const body = await res.json();
      const results = Array.isArray(body.results) ? body.results : (body.results || []);

      const moviesById = JSON.parse(localStorage.getItem('moviesById') || '{}');
      const added = [];
      for (const item of results) {
        if (item && item.imdbID && !item.error) {
          moviesById[item.imdbID] = item;
          added.push(item);
        } else if (item && item.imdbID && item.error) {
          console.warn('Error fetching id', item.imdbID, item.error);
        }
      }

      try {
        localStorage.setItem('moviesById', JSON.stringify(moviesById));
      } catch (err) {
        console.warn('Could not persist moviesById', err);
      }

      if (added.length > 0) {
        setFavMovies(prev => {
          const existingIds = new Set(prev.map(m => m.imdbID));
          const toAdd = added.filter(m => !existingIds.has(m.imdbID));
          const merged = [...prev, ...toAdd];
          return sortFavorites(merged, sortMethod);
        });
      }
    } catch (err) {
      console.warn('Batch fetchMissing error', err);
    }
  }, [sortMethod]);

  useEffect(() => {
    const initialMissing = init.missing || [];
    if (initialMissing && initialMissing.length > 0) {
      setTimeout(() => fetchMissing(initialMissing), 0);
    }

    const handleFavsUpdated = () => {
      const result = initialise();
      setFavMovies(sortFavorites(result.favorites, sortMethod));
      if (result.missing && result.missing.length > 0) fetchMissing(result.missing);
    };

    window.addEventListener('favsUpdated', handleFavsUpdated);

    return () => window.removeEventListener('favsUpdated', handleFavsUpdated);
  }, [sortMethod, fetchMissing, init]);


  if (favMovies.length === 0) return null;

  return (
    <div className="favorites">
      <div className="fav-header">
        <h3 className="fav-title">Favorites ({favMovies.length})</h3>
        <div className="fav-sort">
          <label htmlFor="fav-sort" className="fav-sort-label">Sort:</label>
          <select
            id="fav-sort"
            className="fav-sort-select"
            value={sortMethod}
            onChange={(e) => {
              const v = e.target.value;
              setSortMethod(v);
              try { localStorage.setItem('favSort', v); } catch (e) { console.warn('Could not persist favSort', e); }
              setFavMovies(prev => sortFavorites(prev, v));
            }}
          >
            <option value="default">Default</option>
            <option value="title-asc">Title A → Z</option>
            <option value="title-desc">Title Z → A</option>
            <option value="year-desc">Year ↓</option>
            <option value="year-asc">Year ↑</option>
            <option value="rating-desc">Rating ↓</option>
            <option value="rating-asc">Rating ↑</option>
          </select>
        </div>
      </div>
      <div className="fav-list">
  {favMovies.map(movie => (
          <div
            key={movie.imdbID}
            className="fav-item"
            onClick={() => onSelect(movie.imdbID)}
          >
            <img
              src={movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.png'}
              alt={movie.Title}
              loading="lazy"
            />
            <div className="fav-item-body">
              <span className="fav-item-title">{movie.Title}</span>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{movie.Year}</span>
              {movie._cache && (
                <span className="cache-badge">cached: {Math.max(0, Math.floor(movie._cache.ttlMs / 1000))}s</span>
              )}
            </div>
            <button
              className="fav-btn active fav-remove"
              aria-label={`Unfavorite ${movie.Title}`}
              title={`Remove ${movie.Title} from favorites`}
              onClick={(e) => {
                e.stopPropagation();
                try {
                  const favs = JSON.parse(localStorage.getItem('favs') || '[]').filter(id => id !== movie.imdbID);
                  localStorage.setItem('favs', JSON.stringify(favs));
  
                  setFavMovies(prev => prev.filter(m => m.imdbID !== movie.imdbID));

                  try {
                    const msg = `${movie.Title} removed from favorites`;
                    window.dispatchEvent(new CustomEvent('center-alert', { detail: { message: msg, timeout: 3000 } }));
                    console.info(msg);
                  } catch {
                    /* ignore */
                  }
           
                  window.dispatchEvent(new Event('favsUpdated'));
                } catch (err) {
                  console.warn('Could not remove favorite', err);
                }
              }}
            >
              {'❤'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
