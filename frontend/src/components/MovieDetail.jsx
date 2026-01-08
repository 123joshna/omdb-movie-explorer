import React, { useEffect, useState } from 'react';
import { apiUrl } from '../api';

export default function MovieDetail({ imdbID, onClose }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl(`/api/movie/${imdbID}`));
        const d = await res.json();
        if (!canceled) setData(d);
     
        try {
          fetch(apiUrl('/api/metrics/view'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imdbID })
          }).catch(() => {});
        } catch {
          // ignore metric errors
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { canceled = true; };
  }, [imdbID]);

  if (!data) return <div className="modal"><div className="modal-content">Loading...</div></div>;

  const formatTtl = (ms) => {
    if (ms == null) return null;
    if (ms <= 0) return 'expired';
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ${secs % 60}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content">
        <button className="close" onClick={onClose}>Close</button>
        <div className="detail">
          <img src={data.Poster === 'N/A' ? '/placeholder.png' : data.Poster} alt={data.Title} />
          <div className="meta">
            <h2>{data.Title} ({data.Year})</h2>
            {data._cache && (
              <p style={{ fontSize: '12px', color: '#bbb' }}><strong>Cache:</strong> {formatTtl(data._cache.ttlMs)} remaining</p>
            )}
            <p><strong>Director:</strong> {data.Director}</p>
            <p><strong>Actors:</strong> {data.Actors}</p>
            <p><strong>Genre:</strong> {data.Genre}</p>
            <p><strong>Plot:</strong> {data.Plot}</p>
            <p><strong>Ratings:</strong></p>
            <ul>
              {data.Ratings && data.Ratings.map(r => <li key={r.Source}>{r.Source}: {r.Value}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
