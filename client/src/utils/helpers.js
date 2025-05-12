// client/src/utils/helpers.js

/**
 * Deduplicate news items based on title similarity
 * @param {Array} newsItems - Array of news items to deduplicate
 * @returns {Array} - Deduplicated news items
 */
export const deduplicateNews = (newsItems) => {
    if (!newsItems || !Array.isArray(newsItems) || newsItems.length === 0) {
      return [];
    }
  
    // Sort by publication date (newest first) to prioritize keeping the most recent version
    const sortedItems = [...newsItems].sort((a, b) =>
      new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
    );
  
    const uniqueItems = [];
    const titleMap = new Map(); // Map to track seen titles
  
    sortedItems.forEach(item => {
      if (!item || !item.title) return;
      
      // Normalize the title for comparison by:
      // 1. Converting to lowercase
      // 2. Removing extra whitespace
      // 3. Removing punctuation
      const normalizedTitle = item.title
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .trim();
  
      // If the normalized title is new or this is from a higher priority source
      if (!titleMap.has(normalizedTitle)) {
        titleMap.set(normalizedTitle, item);
        uniqueItems.push(item);
      }
    });
  
    return uniqueItems;
  };
  
  /**
   * Get sentiment display information for a news item
   * @param {Object} item - News item with sentiment data
   * @returns {Object} - Sentiment display information (emoji, text, class)
   */
  export const getSentimentDisplay = (item) => {
    if (!item) {
      return { emoji: '😐', text: 'Neutral', class: 'sentiment-neutral' };
    }
    
    // Use backend provided sentiment if available
    const sentiment = 
      item.sentiment && 
      typeof item.sentiment === 'object' && 
      item.sentiment.assessment 
        ? item.sentiment.assessment 
        : 'neutral';
    
    const isPolish = item.detectedLanguage === 'pl';
    
    if (sentiment === 'positive') {
      return {
        emoji: '😊',
        text: isPolish ? 'Pozytywny' : 'Positive',
        class: 'sentiment-positive'
      };
    } else if (sentiment === 'negative') {
      return {
        emoji: '😟',
        text: isPolish ? 'Negatywny' : 'Negative',
        class: 'sentiment-negative'
      };
    } else {
      return {
        emoji: '😐',
        text: isPolish ? 'Neutralny' : 'Neutral',
        class: 'sentiment-neutral'
      };
    }
  };
  
  /**
   * Sort news items by publication date (newest first)
   * @param {Array} newsItems - Array of news items to sort
   * @returns {Array} - Sorted news items
   */
  export const sortNewsByDate = (newsItems) => {
    if (!Array.isArray(newsItems)) return [];
    
    return [...newsItems].sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0);
      const dateB = new Date(b.publishedAt || 0);
      return dateB - dateA;
    });
  };
  
  /**
   * Detect if text is likely in Polish
   * @param {string} text - Text to analyze
   * @returns {boolean} - True if likely Polish
   */
  export const isPolishText = (text) => {
    if (!text || typeof text !== 'string') return false;
    
    // Check for Polish-specific characters
    const polishChars = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
    
    return polishChars.test(text);
  };
  
  /**
   * Load data from local storage with a fallback value
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} - Retrieved value or default
   */
  export const loadFromStorage = (key, defaultValue) => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Error loading from storage (key: ${key}):`, error);
      return defaultValue;
    }
  };
  
  /**
   * Save data to local storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  export const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to storage (key: ${key}):`, error);
    }
  };
  
  export default {
    deduplicateNews,
    getSentimentDisplay,
    sortNewsByDate,
    isPolishText,
    loadFromStorage,
    saveToStorage
  };