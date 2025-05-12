// server/models/Source.js

/**
 * News source data model
 * This is a simple object model (not a database model)
 * 
 * @typedef {Object} Source
 * @property {string} id - Unique identifier
 * @property {string} name - Source display name
 * @property {string} [url] - RSS feed URL (if applicable)
 * @property {string} [category] - Source category
 * @property {string} [language] - Source language code
 * @property {string} [country] - Source country code
 * @property {boolean} [enabled] - Whether the source is enabled by default
 */

/**
 * Create a new news source object
 * @param {Object} data - Source data
 * @returns {Source} - Source object
 */
function createSource(data) {
    return {
      id: data.id || '',
      name: data.name || '',
      url: data.url || null,
      category: data.category || 'general',
      language: data.language || 'en',
      country: data.country || null,
      enabled: data.enabled !== undefined ? data.enabled : false
    };
  }
  
  /**
   * Create category mapping
   * @param {Array<Source>} sources - Array of sources
   * @returns {Object} - Sources grouped by category
   */
  function createCategoryMapping(sources) {
    if (!sources || !Array.isArray(sources)) {
      return {};
    }
    
    return sources.reduce((mapping, source) => {
      const category = source.category || 'general';
      
      if (!mapping[category]) {
        mapping[category] = [];
      }
      
      mapping[category].push({
        id: source.id,
        name: source.name
      });
      
      return mapping;
    }, {});
  }
  
  module.exports = {
    createSource,
    createCategoryMapping
  };