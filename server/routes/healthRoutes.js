// server/routes/healthRoutes.js
const express = require('express');
const {
  getHealth,
  clearCache
} = require('../controllers/healthController');

const router = express.Router();

// GET /api/health - Get API health status
router.get(
  '/',
  getHealth
);

// POST /api/health/clear-cache - Clear cache (admin)
router.post(
  '/clear-cache',
  clearCache
);

module.exports = router;