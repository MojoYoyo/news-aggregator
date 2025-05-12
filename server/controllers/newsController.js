// server/controllers/newsController.js
const { 
  fetchFromMultipleSources, 
  fetchNewsByCategory, 
  fetchNewsByCountry,
  searchNews,
  deduplicateNews,
  fetchLatestNews  // Make sure this is imported from newsService
} = require('../services/newsService');
const { fetchPolishNews } = require('../services/rssService');
const { ApiError } = require('../middleware/errorMiddleware');

/**
 * Get news from selected sources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getNews = async (req, res, next) => {
  try {
    const { sources = [], translate = false, country = null } = req.body;

    // Make it more fault-tolerant
    if (!sources || !Array.isArray(sources)) {
      // Default to fetching Polish news if no sources provided
      const polishNews = await fetchPolishNews();
      const enhancedNews = {
        items: polishNews,
        clusters: []
      };
      return res.json(enhancedNews);
    }

    const news = await fetchFromMultipleSources(sources, { translate, country });
    
    res.json(news);
  } catch (error) {
    next(error);
  }
};

/**
 * Get news by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getNewsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { country } = req.query;

    const news = await fetchNewsByCategory(category, country);
    
    res.json(news);
  } catch (error) {
    next(error);
  }
};

/**
 * Get news by country
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getNewsByCountry = async (req, res, next) => {
  try {
    const { country } = req.params;
    
    const news = await fetchNewsByCountry(country);
    
    res.json(news);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Polish news
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPolishNews = async (req, res, next) => {
  try {
    let allPolishNews = await fetchPolishNews();
    
    // Apply deduplication
    allPolishNews = deduplicateNews(allPolishNews);
    
    res.json(allPolishNews);
  } catch (error) {
    next(error);
  }
};

/**
 * Search news
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const searchNewsController = async (req, res, next) => {
  try {
    const { q, sources, country, limit } = req.query;

    if (!q) {
      throw new ApiError(400, 'Query parameter "q" is required');
    }

    const sourcesList = sources ? sources.split(',') : [];
    const maxResults = limit ? parseInt(limit) : 20;

    const results = await searchNews(q, sourcesList, country, maxResults);
    
    res.json(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get latest news since a specific timestamp
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getLatestNews = async (req, res, next) => {
  try {
    const { timestamp, sources = [], translate = false, country = null } = req.body;
    
    if (!timestamp) {
      throw new ApiError(400, 'Timestamp is required');
    }
    
    // Fetch latest news
    const latestNews = await fetchLatestNews(sources, timestamp, { translate, country });
    
    res.json(latestNews);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNews,
  getNewsByCategory,
  getNewsByCountry,
  getPolishNews,
  searchNewsController,
  getLatestNews
};