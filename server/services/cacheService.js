// server/services/cacheService.js
const NodeCache = require('node-cache');

// Create cache instance with default TTL of 1 minutes
const cache = new NodeCache({
  stdTTL: 60, // 1 minutes
  checkperiod: 60 // Check for expired keys every 2 minutes
});

/**
 * Get item from cache
 * @param {string} key - Cache key
 * @returns {any} - Cached value or undefined if not found
 */
const getCache = (key) => {
  return cache.get(key);
};

/**
 * Set item in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {boolean} - True if successful
 */
const setCache = (key, value, ttl = 60) => {
  return cache.set(key, value, ttl);
};

/**
 * Delete item from cache
 * @param {string} key - Cache key
 * @returns {number} - Number of deleted entries
 */
const deleteCache = (key) => {
  return cache.del(key);
};

/**
 * Flush entire cache
 * @returns {void}
 */
const flushCache = () => {
  return cache.flushAll();
};

/**
 * Get cache statistics
 * @returns {Object} - Cache stats
 */
const getCacheStats = () => {
  return cache.getStats();
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  flushCache,
  getCacheStats,
  cache
};