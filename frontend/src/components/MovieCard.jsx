import React, { useState, useEffect } from 'react';

export default function MovieCard({ movie, onSelect }) {
  const { Poster, Title, Year, imdbID } = movie;
  const poster = Poster && Poster !== 'N/A' ? Poster : '/placeholder.png';

  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favs') || '[]');
    setIsFav(favs.includes(imdbID));
  }, [imdbID]);

  const handleFavorite = (e) => {
    e.stopPropagation();
    let favs = JSON.parse(localStorage.getItem('favs') || '[]');

    const wasFav = favs.includes(imdbID);

    if (!wasFav) {
      favs.push(imdbID);
      setIsFav(true);
    } else {
      favs = favs.filter(id => id !== imdbID);
      setIsFav(false);
    }

    localStorage.setItem('favs', JSON.stringify(favs));

    try {
      const moviesById = JSON.parse(localStorage.getItem('moviesById') || '{}');
      moviesById[imdbID] = movie;
      localStorage.setItem('moviesById', JSON.stringify(moviesById));
    } catch (err) {
      console.warn('Could not persist movie in moviesById', err);
    }


    try {
      const msg = !wasFav ? `${Title} added to favorites` : `${Title} removed from favorites`;
     
      window.dispatchEvent(new CustomEvent('center-alert', { detail: { message: msg, timeout: 3000 } }));

      console.info(msg);
    } catch {
      /* ignore */
    }


    window.dispatchEvent(new Event("storage"));

    window.dispatchEvent(new Event("favsUpdated"));
  };

  return (
    <div className="card" onClick={() => onSelect(imdbID)}>
      <img src={poster} alt={Title} loading="lazy" />
      <div className="info">
        <h3>{Title}</h3>
        <p>{Year}</p>
        <button 
          className={`fav-btn ${isFav ? 'active' : ''}`} 
          onClick={handleFavorite}
        >
          {isFav ? '❤' : '♡'}
        </button>
      </div>
    </div>
  );
}
