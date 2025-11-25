import React from 'react';
import MovieCard from './MovieCard';

export default function ResultsGrid({ results, onSelect }) {
  if (!results || results.length === 0) {
    return <div className="empty">No results. Try searching a movie title.</div>;
  }
  return (
    <div className="grid">
      {results.map(r => (
        <MovieCard key={r.imdbID} movie={r} onSelect={onSelect} />
      ))}
    </div>
  );
}
