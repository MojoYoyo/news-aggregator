// client/src/services/api.js
/**
 * Base API service for making HTTP requests
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Makes a GET request to the API
 * @param {string} endpoint - API endpoint to call
 * @param {Object} params - Query parameters
 * @returns {Promise<any>} - Response data
 */
export const get = async (endpoint, params = {}) => {
  try {
    // Build query string from params
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => {
        if (Array.isArray(params[key])) {
          return `${key}=${params[key].join(',')}`;
        }
        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join('&');
    
    const url = `${API_BASE_URL}/api/${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in GET request to ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Makes a POST request to the API
 * @param {string} endpoint - API endpoint to call
 * @param {Object} data - Request body data
 * @returns {Promise<any>} - Response data
 */
export const post = async (endpoint, data = {}) => {
  try {
    const url = `${API_BASE_URL}/api/${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in POST request to ${endpoint}:`, error);
    throw error;
  }
};

export default {
  get,
  post
};