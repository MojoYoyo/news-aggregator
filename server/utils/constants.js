// server/utils/constants.js

/**
 * News API response status codes
 */
const API_STATUS = {
    OK: 'ok',
    ERROR: 'error'
  };
  
  /**
   * HTTP status codes
   */
  const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  };
  
  /**
   * Cache TTL values (in seconds)
   */
  const CACHE_TTL = {
    SHORT: 5 * 60, // 5 minutes
    MEDIUM: 10 * 60, // 10 minutes
    LONG: 60 * 60, // 1 hour
    VERY_LONG: 24 * 60 * 60 // 1 day
  };
  
  /**
   * News categories
   */
  const NEWS_CATEGORIES = {
    GENERAL: 'general',
    BUSINESS: 'business',
    ENTERTAINMENT: 'entertainment',
    HEALTH: 'health',
    SCIENCE: 'science',
    SPORTS: 'sports',
    TECHNOLOGY: 'technology',
    POLITICS: 'politics',
    WORLD: 'world'
  };
  
  /**
   * Country codes
   */
  const COUNTRY_CODES = {
    ALL: 'all',
    US: 'us',
    GB: 'gb',
    PL: 'pl',
    DE: 'de',
    FR: 'fr'
  };
  
  module.exports = {
    API_STATUS,
    HTTP_STATUS,
    CACHE_TTL,
    NEWS_CATEGORIES,
    COUNTRY_CODES
  };