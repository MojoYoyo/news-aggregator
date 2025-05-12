// server/middleware/cacheMiddleware.js
const { getCache, setCache } = require('../services/cacheService');

/**
 * Middleware to cache API responses
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Create a cache key from the URL and query params
    const cacheKey = `${req.originalUrl}`;
    
    // Try to get data from cache
    const cachedData = getCache(cacheKey);
    
    if (cachedData) {
      // Return cached data
      return res.json(cachedData);
    }
    
    // If no cache hit, continue to the route handler
    // Store the original res.json method
    const originalJson = res.json;
    
    // Override res.json method to cache the response before sending
    res.json = function(data) {
      // Cache the response data
      setCache(cacheKey, data, duration);
      
      // Call the original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  cacheMiddleware
};