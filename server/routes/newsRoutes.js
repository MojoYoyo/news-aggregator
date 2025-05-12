// server/routes/newsRoutes.js
const express = require('express');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');
const {
  getNews,
  getNewsByCategory,
  getNewsByCountry,
  getPolishNews,
  searchNewsController,
  getLatestNews  // Make sure this is imported from the controller
} = require('../controllers/newsController');

const router = express.Router();

// POST /api/news - Get news from selected sources - REMOVED VALIDATION TEMPORARILY
router.post('/', getNews);

// GET /api/news/category/:category - Get news by category
router.get(
  '/category/:category',
  [
    param('category').isString().withMessage('Category must be a string'),
    query('country').optional().isString().withMessage('Country must be a string'),
    validateRequest
  ],
  cacheMiddleware(10 * 60), // Cache for 10 minutes
  getNewsByCategory
);

// GET /api/news/country/:country - Get news by country
router.get(
  '/country/:country',
  [
    param('country').isString().withMessage('Country must be a string'),
    validateRequest
  ],
  cacheMiddleware(10 * 60), // Cache for 10 minutes
  getNewsByCountry
);

// GET /api/news/polish - Get news from Polish sources
router.get(
  '/polish',
  cacheMiddleware(10 * 60), // Cache for 10 minutes
  getPolishNews
);

// GET /api/news/search - Search news
router.get(
  '/search',
  [
    query('q').isString().withMessage('Query parameter "q" is required'),
    query('sources').optional().isString().withMessage('Sources must be a comma-separated string'),
    query('country').optional().isString().withMessage('Country must be a string'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be a number between 1 and 100'),
    validateRequest
  ],
  cacheMiddleware(5 * 60), // Cache for 5 minutes
  searchNewsController
);

// POST /api/news/latest - Get latest news since timestamp
router.post(
  '/latest',
  getLatestNews
);

module.exports = router;