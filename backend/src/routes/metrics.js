const express = require('express');
const router = express.Router();
const cache = require('../cache/memoryCache');

router.post('/view', async (req, res) => {
  try {
    const { imdbID } = req.body || {};
    if (!imdbID) return res.status(400).json({ error: 'imdbID is required' });

    const today = new Date().toISOString().slice(0, 10);
    const key = `metrics:views:${today}`;

    const existing = (await cache.get(key)) || {};
    const current = parseInt(existing[imdbID] || 0, 10) + 1;
    existing[imdbID] = current;

    await cache.set(key, existing);

    return res.json({ ok: true, imdbID, count: current });
  } catch (err) {
    console.error('Metrics view error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
