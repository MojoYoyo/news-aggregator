// server/utils/helpers.js

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text with ellipsis if needed
 */
function truncateText(text, maxLength = 250) {
    if (!text) return '';
  
    // Remove any HTML tags first
    const strippedText = text.replace(/<\/?[^>]+(>|$)/g, "");
  
    if (strippedText.length <= maxLength) {
      return strippedText;
    }
  
    // Find a good breaking point (space) to avoid cutting words
    const breakPoint = strippedText.lastIndexOf(' ', maxLength);
    const truncated = strippedText.substring(0, breakPoint > 0 ? breakPoint : maxLength);
  
    return truncated + '...';
  }
  
  /**
   * Format a date to a readable string
   * @param {string|Date} date - Date to format
   * @param {string} locale - Locale for formatting (default: en-US)
   * @returns {string} - Formatted date string
   */
  function formatDate(date, locale = 'en-US') {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return dateObj.toLocaleDateString(locale, options);
  }
  
  /**
   * Capitalize the first letter of a string
   * @param {string} string - String to capitalize
   * @returns {string} - Capitalized string
   */
  function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  /**
   * Generate a random ID
   * @param {number} length - Length of ID
   * @returns {string} - Random ID
   */
  function generateId(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    
    for (let i = 0; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return id;
  }
  
  module.exports = {
    truncateText,
    formatDate,
    capitalizeFirstLetter,
    generateId
  };