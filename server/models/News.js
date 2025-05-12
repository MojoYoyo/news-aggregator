// server/models/News.js

/**
 * News item data model
 * This is a simple object model (not a database model)
 * 
 * @typedef {Object} News
 * @property {string} id - Unique identifier
 * @property {string} title - News title
 * @property {string} [translatedTitle] - Translated title (if applicable)
 * @property {string} source - Source name
 * @property {string} sourceId - Source identifier
 * @property {string} url - Link to full article
 * @property {string} publishedAt - Publication date (ISO format)
 * @property {string} [author] - Article author
 * @property {string} [description] - Short description/snippet
 * @property {string} [fullDescription] - Full description
 * @property {string} [fullContent] - Full content text (if available)
 * @property {string} [imageUrl] - Image URL
 * @property {string} [content] - Article content (truncated)
 * @property {string} [category] - Article category
 * @property {string} [country] - Country code
 * @property {Object} [sentiment] - Sentiment analysis results
 * @property {string} [detectedLanguage] - Detected language code
 * @property {Array<string>} [entities] - Extracted entities
 */

/**
 * Create a new news item object
 * @param {Object} data - News item data
 * @returns {News} - News item object
 */
function createNewsItem(data) {
    return {
      id: data.id || `news-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: data.title || '',
      translatedTitle: data.translatedTitle || null,
      source: data.source || '',
      sourceId: data.sourceId || '',
      url: data.url || '',
      publishedAt: data.publishedAt || new Date().toISOString(),
      author: data.author || '',
      description: data.description || '',
      fullDescription: data.fullDescription || data.description || '',
      fullContent: data.fullContent || '',
      imageUrl: data.imageUrl || '',
      content: data.content || '',
      category: data.category || 'general',
      country: data.country || 'en',
      sentiment: data.sentiment || null,
      detectedLanguage: data.detectedLanguage || null,
      entities: data.entities || []
    };
  }
  
  /**
   * Process an array of news items
   * @param {Array} items - Raw news items
   * @returns {Array<News>} - Processed news items
   */
  function processNewsItems(items) {
    if (!items || !Array.isArray(items)) {
      return [];
    }
    
    return items.map(item => createNewsItem(item));
  }
  
  module.exports = {
    createNewsItem,
    processNewsItems
  };