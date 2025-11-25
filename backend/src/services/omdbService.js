const axios = require('axios');
const cache = require('../cache/memoryCache');

const API_URL = process.env.OMDB_BASE_URL || 'https://www.omdbapi.com/';
const API_KEY = process.env.OMDB_API_KEY;

module.exports = {
  async search(title, page = 1) {
    const key = `search:${title}:${page}`;

    const cached = await cache.get(key);
    if (cached) return cached;


    const res = await axios.get(API_URL, {
      params: {
        apikey: API_KEY,
        s: title,
        page
      }
    });

    await cache.set(key, res.data);
    return res.data;
  },

  async getById(id) {
    const key = `id:${id}`;

    const cached = await cache.get(key);
    if (cached) return cached;

    const res = await axios.get(API_URL, {
      params: {
        apikey: API_KEY,
        i: id,
        plot: 'full'
      }
    });

    await cache.set(key, res.data);
    return res.data;
  }
};
