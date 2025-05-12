// server/services/sourceService.js
const config = require('../config');
const { getCache, setCache } = require('./cacheService');

/**
 * Get all available news sources grouped by category
 * @returns {Object} - Sources grouped by category
 */
function getAvailableSources() {
  const cacheKey = 'available_sources';
  const cachedSources = getCache(cacheKey);
  
  if (cachedSources) {
    return cachedSources;
  }
  
  try {
    // Create structured sources object
    const sourcesByCategory = {
      polish: config.polishSources.map(source => ({
        id: source.id,
        name: source.name
      })),

      major_rss: config.majorSources.map(source => ({
        id: source.id,
        name: source.name
      })),

      major_api: [
        { id: 'guardian', name: 'The Guardian' },
        { id: 'nytimes', name: 'The New York Times' },
        { id: 'bbc-news', name: 'BBC News' },
        { id: 'cnn', name: 'CNN' }
      ],
      
      international: [
        { id: 'al-jazeera-english', name: 'Al Jazeera' },
        { id: 'reuters', name: 'Reuters' },
        { id: 'associated-press', name: 'Associated Press' }
      ],
      
      business: [
        { id: 'bloomberg', name: 'Bloomberg' },
        { id: 'financial-times', name: 'Financial Times' },
        { id: 'business-insider', name: 'Business Insider' },
        { id: 'fortune', name: 'Fortune' }
      ],
    };
    
    // Cache the sources
    setCache(cacheKey, sourcesByCategory, 60 * 60); // Cache for 1 hour
    
    return sourcesByCategory;
  } catch (error) {
    console.error('Error getting available sources:', error);
    
    // Return a minimal set in case of error
    return {
      polish: config.polishSources.map(source => ({
        id: source.id,
        name: source.name
      })),
      major_rss: config.majorSources.map(source => ({
        id: source.id,
        name: source.name
      }))
    };
  }
}

/**
 * Get available countries for filtering
 * @returns {Array} - List of countries
 */
function getAvailableCountries() {
  const countries = [
    { code: 'all', name: 'All Countries' },
    { code: 'pl', name: 'Poland' },
    { code: 'us', name: 'USA' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'de', name: 'Germany' },
    { code: 'fr', name: 'France' }
  ];
  
  return countries;
}

/**
 * Reload RSS sources from configuration
 * Normally, this would reload from files, but in this refactored version
 * we'll just return the current configuration (no dynamic reloading)
 * @returns {Object} - Object containing loaded sources
 */
function reloadRssSources() {
  return {
    polishSources: config.polishSources,
    majorSources: config.majorSources
  };
}

/**
 * Get health information about the news service
 * @returns {Object} - Health information
 */
function getHealthInfo() {
  return {
    status: 'ok',
    version: '2.3.0',
    availableSources: getSourcesCount(),
    categories: Object.keys(config.categories).length,
    countries: getAvailableCountries().length - 1, // Not counting "all"
    polishSources: config.polishSources.length,
    majorSources: config.majorSources.length
  };
}

/**
 * Get the total count of available sources
 * @returns {number} - Total sources count
 */
function getSourcesCount() {
  const sources = getAvailableSources();
  let count = 0;
  
  // Count all sources across categories
  Object.values(sources).forEach(categorySources => {
    count += categorySources.length;
  });
  
  return count;
}

module.exports = {
  getAvailableSources,
  getAvailableCountries,
  reloadRssSources,
  getHealthInfo
};