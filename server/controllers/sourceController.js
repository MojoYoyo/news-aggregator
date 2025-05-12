// server/controllers/sourceController.js
const { 
    getAvailableSources, 
    getAvailableCountries, 
    reloadRssSources 
  } = require('../services/sourceService');
  const { ApiError } = require('../middleware/errorMiddleware');
  
  /**
   * Get all available sources
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  const getSources = async (req, res, next) => {
    try {
      const sources = getAvailableSources();
      res.json(sources);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get available countries
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  const getCountries = async (req, res, next) => {
    try {
      const countries = getAvailableCountries();
      res.json(countries);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Reload RSS sources (admin)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  const reloadSources = async (req, res, next) => {
    try {
      // Check API key for admin access
      const apiKey = req.headers['x-api-key'];
      
      // Simple API key check - in production, use a more secure approach
      if (apiKey !== process.env.ADMIN_API_KEY) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      const reloadedSources = reloadRssSources();
      
      res.json({
        message: 'RSS sources reloaded successfully',
        polishSourcesCount: reloadedSources.polishSources.length,
        majorSourcesCount: reloadedSources.majorSources.length
      });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = {
    getSources,
    getCountries,
    reloadSources
  };