// server/routes/sourceRoutes.js
const express = require('express');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');
const {
  getSources,
  getCountries,
  reloadSources
} = require('../controllers/sourceController');

const router = express.Router();

// GET /api/sources - Get all available sources
router.get(
  '/',
  cacheMiddleware(60 * 60), // Cache for 1 hour
  getSources
);

// GET /api/sources/countries - Get available countries
router.get(
  '/countries',
  cacheMiddleware(60 * 60), // Cache for 1 hour
  getCountries
);

// POST /api/sources/reload - Reload RSS sources (admin)
router.post(
  '/reload',
  reloadSources
);

module.exports = router;