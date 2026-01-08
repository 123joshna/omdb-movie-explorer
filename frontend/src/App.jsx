import React, { useState, Suspense, lazy, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ResultsGrid from './components/ResultsGrid';
const MovieDetail = lazy(() => import('./components/MovieDetail'));
import Favorites from './components/Favorites';
import CenteredAlert from './components/CenteredAlert';
import { apiUrl } from '../api';

export default function App() {
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
   
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/search/trending'));
        if (!res.ok) return;
        const data = await res.json();
        const list = data.Search || [];
        setResults(list);
        try { localStorage.setItem('allMovies', JSON.stringify(list || [])); } catch (err) { console.warn('Could not persist allMovies', err); }
      } catch (err) {
        console.warn('Could not load trending movies', err);
      } finally {
        setLoadingInitial(false);
      }
    })();
  }, []);

  return (
    <div className="app">
      <CenteredAlert />
      <header className="topbar">
        <h1>OMDB Movie Explorer</h1>
      </header>

      <main className="container">
        <SearchBar
          onSearch={(q, data) => {
            setResults(data);
            setQuery(q || '');

            try {
              localStorage.setItem('allMovies', JSON.stringify(data || []));
            } catch (err) {
              console.warn('Could not save allMovies to localStorage', err);
            }
          }}
        />
  {!query?.trim() && (
    <h2 className="trending-title">Top Rated</h2>
  )}
  <ResultsGrid results={results} onSelect={setSelected} />
  {loadingInitial && <p style={{ textAlign: 'center', color: '#bbb' }}>Loading trending movies…</p>}
        {/* Favorites shown below the results grid */}
        <Favorites onSelect={setSelected} />
        {selected && (
          <Suspense fallback={<div className="modal"><div className="modal-content">Loading...</div></div>}>
            <MovieDetail imdbID={selected} onClose={() => setSelected(null)} />
          </Suspense>
        )}
      </main>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} OMDB Movie Explorer. Built with the OMDB API.
        </p>
        <p>
          <a href="https://www.omdbapi.com/" target="_blank" rel="noreferrer">OMDB API</a>
          {' • '}
          <a href="https://github.com/your-repo/omdb-movie-explorer" target="_blank" rel="noreferrer">View source</a>
        </p>
      </footer>
    </div>
  );
}
