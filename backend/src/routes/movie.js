const express = require('express');
const router = express.Router();
const omdb = require('../services/omdbService');
const cache = require('../cache/memoryCache');

router.get('/search', async (req, res) => {
  try {
    const title = req.query.title;
    const page = req.query.page || 1;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const data = await omdb.search(title, page);
    return res.json(data);

  } catch (err) {
    console.error('Search error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: 'id required' });
    }

    const data = await omdb.getById(id);

    try {
      const key = `id:${id}`;
      const ttlMs = cache.getRemainingTTL(key);
      if (ttlMs != null) {
  
        if (data && typeof data === 'object') data._cache = { ttlMs };
      }
    } catch (err) {
  
    }

    return res.json(data);

  } catch (err) {
    console.error('Movie detail error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const ids = req.body && req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids (array) required in body' });
    }

    const promises = ids.map(id => omdb.getById(id).catch(err => ({ error: String(err), imdbID: id })));
    const results = await Promise.all(promises);

    try {
      for (const item of results) {
        if (item && item.imdbID) {
          const key = `id:${item.imdbID}`;
          const ttlMs = cache.getRemainingTTL(key);
          if (ttlMs != null && typeof item === 'object') {
            item._cache = { ttlMs };
          }
        }
      }
    } catch (err) {

    }

    return res.json({ results });
  } catch (err) {
    console.error('Batch movie detail error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
