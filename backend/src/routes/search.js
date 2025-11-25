const express = require('express');
const router = express.Router();
const omdb = require('../services/omdbService');

router.get('/', async (req, res) => {
  try {
    const title = req.query.title;
    const page = req.query.page || 1;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const data = await omdb.search(title, page);
    return res.json(data);

  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const cache = require('../cache/memoryCache');

router.get('/trending', async (req, res) => {
  try {
   
    if (req.query && String(req.query.mode) === 'weeklyViews') {
  
      const counts = new Map();
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
        const key = `metrics:views:${d}`;
        try {
          const day = (await cache.get(key)) || {};
          for (const [id, c] of Object.entries(day)) {
            const prev = counts.get(id) || 0;
            counts.set(id, prev + (parseInt(c, 10) || 0));
          }
        } catch (err) {
   
        }
      }

 
      const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(x => x[0]);
      const topIds = sorted.slice(0, 20);

      const details = await Promise.all(topIds.map(id => omdb.getById(id).catch(() => null)));
      const movies = details.filter(d => d && d.imdbID && d.Type === 'movie');

      const byId = new Map(movies.map(m => [m.imdbID, m]));
      const ordered = topIds.map(id => byId.get(id)).filter(Boolean).slice(0, 12);
      return res.json({ Search: ordered });
    }


    if (req.query && String(req.query.mode) === 'monthlyRating') {
     
      const counts = new Map();
      for (let i = 0; i < 30; i++) {
        const d = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
        const key = `metrics:views:${d}`;
        try {
          const day = (await cache.get(key)) || {};
          for (const [id, c] of Object.entries(day)) {
            const prev = counts.get(id) || 0;
            counts.set(id, prev + (parseInt(c, 10) || 0));
          }
        } catch (err) {
     
        }
      }

 
      if (counts.size === 0) return res.json({ Search: [] });


      const sortedByCount = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(x => x[0]);
      const candidateIds = sortedByCount.slice(0, 400);

      const details = await Promise.all(candidateIds.map(id => omdb.getById(id).catch(() => null)));
      const movies = details.filter(d => d && d.imdbID && d.Type === 'movie' && d.imdbRating && !isNaN(parseFloat(d.imdbRating)));

 
      movies.sort((a, b) => {
        const ra = parseFloat(a.imdbRating) || 0;
        const rb = parseFloat(b.imdbRating) || 0;
        if (rb === ra) {
          const ca = counts.get(a.imdbID) || 0;
          const cb = counts.get(b.imdbID) || 0;
          if (cb === ca) return (parseInt(b.Year, 10) || 0) - (parseInt(a.Year, 10) || 0);
          return cb - ca;
        }
        return rb - ra;
      });

      const top = movies.slice(0, 12);
      return res.json({ Search: top });
    }

    if (req.query && String(req.query.mode) === 'yearlyRating') {
   
      const counts = new Map();
      for (let i = 0; i < 365; i++) {
        const d = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
        const key = `metrics:views:${d}`;
        try {
          const day = (await cache.get(key)) || {};
          for (const [id, c] of Object.entries(day)) {
            const prev = counts.get(id) || 0;
            counts.set(id, prev + (parseInt(c, 10) || 0));
          }
        } catch (err) {
     
        }
      }

      if (counts.size === 0) return res.json({ Search: [] });

      const sortedByCount = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(x => x[0]);
      const candidateIds = sortedByCount.slice(0, 800);

      const details = await Promise.all(candidateIds.map(id => omdb.getById(id).catch(() => null)));
      const movies = details.filter(d => d && d.imdbID && d.Type === 'movie' && d.imdbRating && !isNaN(parseFloat(d.imdbRating)));

      movies.sort((a, b) => {
        const ra = parseFloat(a.imdbRating) || 0;
        const rb = parseFloat(b.imdbRating) || 0;
        if (rb === ra) {
          const ca = counts.get(a.imdbID) || 0;
          const cb = counts.get(b.imdbID) || 0;
          if (cb === ca) return (parseInt(b.Year, 10) || 0) - (parseInt(a.Year, 10) || 0);
          return cb - ca;
        }
        return rb - ra;
      });

      const top = movies.slice(0, 12);
      return res.json({ Search: top });
    }
    const todayKey = `trending:${new Date().toISOString().slice(0, 10)}`; 

    const cached = await cache.get(todayKey);
    if (cached) return res.json(cached);

    
    const seeds = ['Avengers', 'Batman', 'Star Wars', 'Harry Potter', 'Lord of the Rings', 'Spider-Man', 'Inception', 'Matrix'];
    const promises = seeds.map(s => omdb.search(s, 1).catch(err => ({ Search: [] })));
    const resultsArr = await Promise.all(promises);

    const seen = new Set();
    const merged = [];
    for (const r of resultsArr) {
      const list = r && r.Search ? r.Search : [];
      for (const item of list) {
        if (!item || !item.imdbID) continue;
        if (seen.has(item.imdbID)) continue;
        seen.add(item.imdbID);
        merged.push(item);
        if (merged.length >= 40) break; 
      }
      if (merged.length >= 40) break;
    }


    const detailsPromises = merged.map(m => omdb.getById(m.imdbID).catch(err => ({ imdbID: m.imdbID, error: err.message })));
    const details = await Promise.all(detailsPromises);

    
    const movies = details.filter(d => d && d.imdbID && d.Type === 'movie' && d.imdbRating && !isNaN(parseFloat(d.imdbRating)));

    movies.sort((a, b) => {
      const ra = parseFloat(a.imdbRating) || 0;
      const rb = parseFloat(b.imdbRating) || 0;
      if (rb === ra) {
       
        return (parseInt(b.Year, 10) || 0) - (parseInt(a.Year, 10) || 0);
      }
      return rb - ra;
    });

    const top = movies.slice(0, 12);
    const payload = { Search: top };


    await cache.set(todayKey, payload);

    return res.json(payload);
  } catch (err) {
    console.error('Trending error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
