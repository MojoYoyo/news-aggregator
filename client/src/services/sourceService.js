// client/src/services/sourceService.js
import { get } from './api';

/**
 * Service for news source-related API calls
 */
export const sourceService = {
  /**
   * Fetch all available news sources
   * @returns {Promise<Object>} - Sources grouped by category
   */
  fetchSources: async () => {
    try {
      const response = await get('sources');
      return response;
    } catch (error) {
      console.error('Error fetching sources:', error);
      throw error;
    }
  },
  
  /**
   * Fetch available countries
   * @returns {Promise<Array>} - List of available countries
   */
  fetchCountries: async () => {
    try {
      const response = await get('countries');
      return response;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  },
  
  /**
   * Get health/status info about the API
   * @returns {Promise<Object>} - API health information
   */
  getApiHealth: async () => {
    try {
      const response = await get('health');
      return response;
    } catch (error) {
      console.error('Error fetching API health:', error);
      throw error;
    }
  }
};

export default sourceService;