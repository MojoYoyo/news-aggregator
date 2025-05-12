// client/src/utils/formatters.js

/**
 * Format a date string to a localized format
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale for formatting (default: pl-PL)
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString, locale = 'pl-PL') => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }
      
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return date.toLocaleDateString(locale, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  /**
   * Truncate text to a specified length and add ellipsis if needed
   * @param {string} text - The text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} - Truncated text with ellipsis if needed
   */
  export const truncateText = (text, maxLength = 250) => {
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
  };
  
  /**
   * Capitalize the first letter of a string
   * @param {string} string - String to capitalize
   * @returns {string} - String with first letter capitalized
   */
  export const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  export default {
    formatDate,
    truncateText,
    capitalizeFirstLetter
  };