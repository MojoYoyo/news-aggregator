// client/src/services/newsService.js
import { get, post } from './api';

/**
 * Service for news-related API calls
 */
export const newsService = {
  /**
   * Fetch news from selected sources
   * @param {Array<string>} sourceIds - Array of source IDs
   * @param {Object} options - Additional options (translate, country)
   * @returns {Promise<Object>} - News data with items and clusters
   */
  fetchNews: async (sourceIds, options = {}) => {
    try {
      const response = await post('news', {
        sources: sourceIds,
        translate: options.translate || false,
        country: options.country || null
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },
  
  /**
   * Fetch latest news since given timestamp
   * @param {Array<string>} sourceIds - Array of source IDs
   * @param {string|Date} timestamp - Timestamp to get news after
   * @param {Object} options - Additional options (translate, country)
   * @returns {Promise<Object>} - Latest news data
   */
  fetchLatestNews: async (sourceIds, timestamp, options = {}) => {
    try {
      console.log('newsService: Fetching latest news since', new Date(timestamp).toLocaleTimeString());
      console.log('newsService: For sources', sourceIds);
      
      const response = await post('news/latest', {
        sources: sourceIds,
        timestamp: timestamp,
        translate: options.translate || false,
        country: options.country || null
      });
      
      console.log('newsService: Latest news response received with', 
        response.items ? response.items.length : 0, 'items');
      
      return response;
    } catch (error) {
      console.error('Error fetching latest news:', error);
      throw error;
    }
  },
  
  /**
   * Fetch news by category
   * @param {string} category - Category name
   * @param {string} country - Country code (optional)
   * @returns {Promise<Array>} - News items for the category
   */
  fetchNewsByCategory: async (category, country = null) => {
    try {
      const params = country ? { country } : {};
      const response = await get(`news/category/${category}`, params);
      return response;
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error);
      throw error;
    }
  },
  
  /**
   * Fetch news by country
   * @param {string} country - Country code
   * @returns {Promise<Array>} - News items for the country
   */
  fetchNewsByCountry: async (country) => {
    try {
      const response = await get(`news/country/${country}`);
      return response;
    } catch (error) {
      console.error(`Error fetching news for ${country}:`, error);
      throw error;
    }
  },
  
  /**
   * Search news across sources
   * @param {string} query - Search query
   * @param {Array<string>} sourceIds - Array of source IDs to search within
   * @param {string} country - Country code (optional)
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Object>} - Search results with items and clusters
   */
  searchNews: async (query, sourceIds = [], country = null, limit = 20) => {
    try {
      const params = {
        q: query,
        sources: sourceIds.length > 0 ? sourceIds.join(',') : undefined,
        country,
        limit
      };
      
      const response = await get('news/search', params);
      return response;
    } catch (error) {
      console.error('Error searching news:', error);
      throw error;
    }
  },
  
  /**
   * Fetch news from Polish sources
   * @returns {Promise<Array>} - News items from Polish sources
   */
  fetchPolishNews: async () => {
    try {
      const response = await get('news/polish');
      return response;
    } catch (error) {
      console.error('Error fetching Polish news:', error);
      throw error;
    }
  }
};

export default newsService;