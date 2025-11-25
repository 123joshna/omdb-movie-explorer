const { LRUCache } = require('lru-cache');

const ttlMs = (parseInt(process.env.CACHE_TTL_SECONDS) || 3600) * 1000;
const maxItems = parseInt(process.env.CACHE_MAX_ITEMS) || 1000;

const cache = new LRUCache({
  max: maxItems,
  ttl: ttlMs,   
});

module.exports = {
  async get(key) {
    return cache.get(key);
  },

  async set(key, value) {
    cache.set(key, value);
  },

  keys() {
    return [...cache.keys()];
  }
  ,
  getRemainingTTL(key) {
    if (typeof cache.getRemainingTTL === 'function') {
      try {
        const v = cache.getRemainingTTL(key);
        return typeof v === 'number' ? v : null;
      } catch (err) {
        return null;
      }
    }
    return null;
  }
};
