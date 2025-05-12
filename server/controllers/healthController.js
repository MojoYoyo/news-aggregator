// server/controllers/healthController.js
const { getHealthInfo } = require('../services/sourceService');
const { getCacheStats, flushCache } = require('../services/cacheService');
const { ApiError } = require('../middleware/errorMiddleware');

/**
 * Get API health status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getHealth = async (req, res, next) => {
  try {
    const healthInfo = getHealthInfo();
    res.json(healthInfo);
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cache (admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const clearCache = async (req, res, next) => {
  try {
    // Check API key for admin access
    const apiKey = req.headers['x-api-key'];
    
    // Simple API key check - in production, use a more secure approach
    if (apiKey !== process.env.ADMIN_API_KEY) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    const stats = getCacheStats();
    flushCache();
    
    res.json({
      message: 'Cache cleared successfully',
      previousStats: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealth,
  clearCache
};