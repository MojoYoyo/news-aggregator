// server/services/newsService.js
const axios = require('axios');
const { translate } = require('@vitalets/google-translate-api');
const { fetchPolishNews, fetchMajorNews } = require('./rssService');
const { processNewsWithClustering } = require('./nlpService');
const { getCache, setCache } = require('./cacheService');
const config = require('../config');
const { ApiError } = require('../middleware/errorMiddleware');

/**
 * Available news sources
 */
const NEWS_SOURCES = {
  // Direct APIs
  GUARDIAN: 'guardian',
  NYTIMES: 'nytimes',

  // Via NewsAPI
  BBC: 'bbc-news',
  CNN: 'cnn',
  REUTERS: 'reuters',
  AL_JAZEERA: 'al-jazeera-english',
  ASSOCIATED_PRESS: 'associated-press',
  BLOOMBERG: 'bloomberg',
  BUSINESS_INSIDER: 'business-insider',
  FINANCIAL_TIMES: 'financial-times',
  FORTUNE: 'fortune'
};

// News API endpoints configuration
const NEWS_API_CONFIG = {
  // The Guardian API
  [NEWS_SOURCES.GUARDIAN]: {
    url: 'https://content.guardianapis.com/search',
    params: {
      'api-key': process.env.GUARDIAN_API_KEY,
      'show-fields': 'headline,byline,thumbnail,bodyText,trailText',
      'page-size': 15,
    },
    transform: (data) => {
      return data.response.results.map(item => ({
        id: item.id,
        title: item.webTitle,
        source: 'The Guardian',
        sourceId: NEWS_SOURCES.GUARDIAN,
        url: item.webUrl,
        publishedAt: item.webPublicationDate,
        author: item.fields?.byline || '',
        description: item.fields?.trailText || '',
        imageUrl: item.fields?.thumbnail || '',
        content: item.fields?.bodyText || '',
        category: item.sectionName?.toLowerCase() || 'general'
      }));
    }
  },

  // New York Times API
  [NEWS_SOURCES.NYTIMES]: {
    url: 'https://api.nytimes.com/svc/topstories/v2/home.json',
    params: {
      'api-key': process.env.NYTIMES_API_KEY
    },
    transform: (data) => {
      return data.results.slice(0, 15).map((item, index) => ({
        id: `nyt-${index}`,
        title: item.title,
        source: 'The New York Times',
        sourceId: NEWS_SOURCES.NYTIMES,
        url: item.url,
        publishedAt: item.published_date,
        author: item.byline || '',
        description: item.abstract || '',
        imageUrl: item.multimedia?.length > 0 ? item.multimedia[0].url : '',
        content: item.abstract || '',
        category: item.section || 'general'
      }));
    }
  },

  // NewsAPI - for multiple sources
  newsapi: {
    url: 'https://newsapi.org/v2/top-headlines',
    params: {
      apiKey: process.env.NEWS_API_KEY,
      pageSize: 15
    },
    transform: (data, sourceId) => {
      return data.articles.map((item, index) => {
        // Determine the actual source name from the item
        const sourceName = item.source?.name || sourceId;

        return {
          id: `${sourceId}-${index}`,
          title: item.title,
          source: sourceName,
          sourceId: sourceId,
          url: item.url,
          publishedAt: item.publishedAt,
          author: item.author || '',
          description: item.description || '',
          imageUrl: item.urlToImage || '',
          content: item.content || '',
          category: 'general' // NewsAPI doesn't provide reliable categories in this endpoint
        };
      });
    }
  },

  // NewsAPI - for categories
  newsapi_category: {
    url: 'https://newsapi.org/v2/top-headlines',
    params: {
      apiKey: process.env.NEWS_API_KEY,
      pageSize: 15,
      language: 'en' // English language news
    },
    transform: (data, category) => {
      return data.articles.map((item, index) => {
        return {
          id: `${category}-${index}`,
          title: item.title,
          source: item.source?.name || 'News API',
          sourceId: item.source?.id || 'newsapi',
          url: item.url,
          publishedAt: item.publishedAt,
          author: item.author || '',
          description: item.description || '',
          imageUrl: item.urlToImage || '',
          content: item.content || '',
          category: category
        };
      });
    }
  }
};

/**
 * Deduplicates news items based on title similarity
 * @param {Array} newsItems - Array of news items to deduplicate
 * @returns {Array} - Deduplicated news items
 */
function deduplicateNews(newsItems) {
  if (!newsItems || newsItems.length === 0) return [];

  // Sort by publication date (newest first) to prioritize keeping the most recent version
  const sortedItems = [...newsItems].sort((a, b) =>
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  const uniqueItems = [];
  const titleMap = new Map(); // Map to track seen titles

  sortedItems.forEach(item => {
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
}

/**
 * Translate text to Polish
 * @param {string} text - Text to translate
 * @returns {Promise<string>} - Translated text
 */
async function translateToPolish(text) {
  try {
    // Skip translation for already Polish text
    if (/^[\p{Script=Latin}\s\d.,!?;:'"()-]+$/u.test(text) &&
      /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(text)) {
      return text;
    }

    const result = await translate(text, { to: 'pl' });
    return result.text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

/**
 * Translate titles of news items to Polish
 * @param {Array} newsItems - News items to translate
 * @returns {Promise<Array>} - News items with translated titles
 */
async function translateNewsTitles(newsItems) {
  if (!newsItems || newsItems.length === 0) return [];
  
  try {
    const translationPromises = newsItems.map(async (item) => {
      item.translatedTitle = await translateToPolish(item.title);
      return item;
    });

    return await Promise.all(translationPromises);
  } catch (error) {
    console.error('Error translating news titles:', error);
    return newsItems;
  }
}

/**
 * Fetch news from specific source
 * @param {string} sourceId - Source ID
 * @param {string} country - Country code (optional)
 * @returns {Promise<Array>} - News items
 */
async function fetchNewsFromSource(sourceId, country = null) {
  const cacheKey = country ? `news_${sourceId}_${country}` : `news_${sourceId}`;
  const cachedData = getCache(cacheKey);

  if (cachedData) {
    console.log(`Using cached data for ${sourceId}${country ? ` in ${country}` : ''}`);
    return cachedData;
  }

  try {
    // Check if the source is a Polish RSS feed
    if (config.polishSources.some(s => s.id === sourceId)) {
      return await fetchPolishNews(sourceId);
    }

    // Check if the source is a major RSS feed
    if (config.majorSources.some(s => s.id === sourceId)) {
      return await fetchMajorNews(sourceId);
    }

    // Handle sources that use NewsAPI
    if (Object.values(NEWS_SOURCES).includes(sourceId) &&
      ![NEWS_SOURCES.GUARDIAN, NEWS_SOURCES.NYTIMES].includes(sourceId)) {

      // Check if we have a valid API key for NewsAPI
      if (!process.env.NEWS_API_KEY) {
        console.warn(`Missing NEWS_API_KEY for source: ${sourceId}`);
        return []; // Return empty array if no API key
      }

      try {
        // It's a specific source via NewsAPI
        const params = {
          ...NEWS_API_CONFIG.newsapi.params,
          sources: sourceId
        };

        const response = await axios.get(NEWS_API_CONFIG.newsapi.url, { params });
        let results = NEWS_API_CONFIG.newsapi.transform(response.data, sourceId);

        // Cache the results
        setCache(cacheKey, results, 10 * 60);
        return results;
      } catch (error) {
        console.error(`Error fetching news from ${sourceId}:`, error.message);
        return []; // Return empty array on error
      }
    }

    // Handle direct API sources (Guardian, NYT)
    const sourceConfig = NEWS_API_CONFIG[sourceId];
    if (!sourceConfig) {
      console.warn(`No configuration for source: ${sourceId}`);
      return [];
    }

    // Check for API keys
    if ((sourceId === NEWS_SOURCES.GUARDIAN && !process.env.GUARDIAN_API_KEY) ||
        (sourceId === NEWS_SOURCES.NYTIMES && !process.env.NYTIMES_API_KEY)) {
      console.warn(`Missing API key for source: ${sourceId}`);
      return []; // Return empty array if API key is missing
    }

    try {
      const response = await axios.get(sourceConfig.url, {
        params: sourceConfig.params
      });

      const results = sourceConfig.transform(response.data);
      setCache(cacheKey, results, 10 * 60);
      return results;
    } catch (error) {
      console.error(`Error fetching from ${sourceId} API:`, error.message);
      return []; // Return empty array on error
    }
  } catch (error) {
    console.error(`Error fetching news from ${sourceId}:`, error.message);
    return [];
  }
}

/**
 * Fetch news from multiple sources or categories
 * @param {Array} sources - Array of source IDs
 * @param {Object} options - Options (translate, country)
 * @returns {Promise<Object>} - News data with items and clusters
 */
async function fetchFromMultipleSources(sources, options = {}) {
  const { translate = false, country = null } = options;
  
  try {
    // Check for valid sources
    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      console.log('No sources provided, defaulting to Polish sources');
      // Default to Polish RSS sources if no sources are provided
      const polishNews = await fetchPolishNews();
      const processedNews = processNewsWithClustering(polishNews);
      return processedNews;
    }
    
    // Fetch from specified sources
    const newsPromises = sources.map(sourceId => fetchNewsFromSource(sourceId, country));
    const newsArrays = await Promise.all(newsPromises);
    let allNews = newsArrays.flat();
    
    console.log(`Fetched ${allNews.length} news items before deduplication`);
    
    // Apply deduplication
    allNews = deduplicateNews(allNews);
    console.log(`${allNews.length} news items after deduplication`);
    
    // Translate titles if requested
    if (translate) {
      allNews = await translateNewsTitles(allNews);
    }
    
    // Process with NLP and clustering
    const processedNews = processNewsWithClustering(allNews);
    
    return processedNews;
  } catch (error) {
    console.error('Error fetching from multiple sources:', error);
    // Return empty news object rather than throwing
    return {
      items: [],
      clusters: []
    };
  }
}

/**
 * Fetch news by country
 * @param {string} country - Country code
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} - News items
 */
async function fetchNewsByCountry(country, maxResults = 20) {
  const cacheKey = `country_${country}`;
  const cachedResults = getCache(cacheKey);

  if (cachedResults) {
    return cachedResults;
  }

  try {
    // For Poland, we use our RSS sources
    if (country === 'pl') {
      return await fetchPolishNews();
    }

    // Check API key
    if (!process.env.NEWS_API_KEY) {
      console.warn('Missing NEWS_API_KEY for country search');
      return []; // Return empty array if no API key
    }

    try {
      const response = await axios.get(NEWS_API_CONFIG.newsapi.url, {
        params: {
          ...NEWS_API_CONFIG.newsapi.params,
          country: country,
          // When using country parameter, we can't specify sources
          sources: undefined
        }
      });

      const results = response.data.articles.map((item, index) => ({
        id: `${country}-${index}`,
        title: item.title,
        source: item.source?.name || 'NewsAPI',
        sourceId: item.source?.id || 'newsapi',
        url: item.url,
        publishedAt: item.publishedAt,
        author: item.author || '',
        description: item.description || '',
        imageUrl: item.urlToImage || '',
        content: item.content || '',
        category: item.category || 'general',
        country: country
      }));

      // Sort by publication date (newest first)
      results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      // Limit the number of results
      const limitedResults = results.slice(0, maxResults);

      // Cache the results
      setCache(cacheKey, limitedResults, 10 * 60);

      return limitedResults;
    } catch (error) {
      console.error(`Error fetching news for country ${country}:`, error.message);
      return []; // Return empty array on error
    }
  } catch (error) {
    console.error(`Error fetching news for country ${country}:`, error.message);
    return [];
  }
}

/**
 * Fetch news by category
 * @param {string} category - Category name
 * @param {string} country - Country code (optional)
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} - News items
 */
async function fetchNewsByCategory(category, country = null, maxResults = 30) {
  const cacheKey = country
    ? `category_${category}_${country}`
    : `category_${category}`;

  const cachedResults = getCache(cacheKey);

  if (cachedResults) {
    console.log(`Using cached results for category: ${category}${country ? ` in ${country}` : ''}`);
    return cachedResults;
  }

  let results = [];

  // Categories directly supported by NewsAPI
  const standardCategories = ['business', 'entertainment', 'health', 'science', 'sports', 'technology'];

  if (standardCategories.includes(category)) {
    // Check API key
    if (process.env.NEWS_API_KEY) {
      // Use the standard NewsAPI category endpoint with optional country
      try {
        const params = {
          ...NEWS_API_CONFIG.newsapi_category.params,
          category: category
        };

        // Add country filter if specified
        if (country && country !== 'all' && country !== 'pl') {
          params.country = country;
        }

        const response = await axios.get(NEWS_API_CONFIG.newsapi_category.url, { params });

        results = NEWS_API_CONFIG.newsapi_category.transform(response.data, category);

        // Add country information to results
        if (country) {
          results = results.map(item => ({
            ...item,
            country: country
          }));
        }
      } catch (error) {
        console.error(`Error fetching ${category} news from NewsAPI:`, error.message);
      }
    } else {
      console.warn('Missing NEWS_API_KEY for category search');
    }
  }

  // For Poland, add category-specific Polish RSS news
  if (country === 'pl' || !country || country === 'all') {
    try {
      const polishNews = await fetchPolishNews();

      // Filter by category
      const categoryMatches = polishNews.filter(article => {
        if (category === 'business' && ['business', 'financial', 'economy', 'money'].includes(article.category)) {
          return true;
        }
        if (category === 'world' && ['world', 'international', 'global'].includes(article.category)) {
          return true;
        }
        if (category === 'sports' && article.category === 'sports') {
          return true;
        }
        if (category === 'politics' && ['politics', 'general'].includes(article.category)) {
          return true;
        }
        // For other categories, do a simple match
        return article.category === category;
      });

      results = [...results, ...categoryMatches];
    } catch (error) {
      console.error(`Error adding Polish RSS news for category ${category}:`, error);
    }
  }

  // Sort by publication date (newest first)
  results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Limit the number of results
  results = results.slice(0, maxResults);

  // Cache the results
  setCache(cacheKey, results, 10 * 60);

  return results;
}

/**
 * Search for news across sources
 * @param {string} query - Search query
 * @param {Array} sources - Array of source IDs
 * @param {string} country - Country code (optional)
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Object>} - Search results with items and clusters
 */
async function searchNews(query, sources = [], country = null, maxResults = 30) {
  // Create a cache key that includes the sources
  const sourcesKey = sources.length > 0 ? sources.join('_') : 'all';
  const cacheKey = `search_${query}_${sourcesKey}${country ? `_${country}` : ''}`;

  const cachedResults = getCache(cacheKey);

  if (cachedResults) {
    console.log(`Using cached search results for: ${query} in sources: ${sourcesKey}`);
    return cachedResults;
  }

  try {
    let results = [];
    const sourceSet = new Set(sources); // For faster lookups

    // Helper function to check if a source is requested
    const isSourceRequested = (sourceId) => {
      // If no specific sources requested, include all
      if (sources.length === 0) return true;
      // Otherwise only include if in the requested sources
      return sourceSet.has(sourceId);
    };

    // Guardian API search - only if specifically requested
    if (isSourceRequested(NEWS_SOURCES.GUARDIAN) && process.env.GUARDIAN_API_KEY) {
      try {
        const response = await axios.get('https://content.guardianapis.com/search', {
          params: {
            'api-key': process.env.GUARDIAN_API_KEY,
            'q': query,
            'show-fields': 'headline,byline,thumbnail,bodyText,trailText',
            'page-size': 15
          }
        });

        const guardianResults = NEWS_API_CONFIG[NEWS_SOURCES.GUARDIAN].transform(response.data);
        results = [...results, ...guardianResults];
      } catch (error) {
        console.error('Error searching Guardian:', error.message);
      }
    }

    // NYT API search - only if specifically requested
    if (isSourceRequested(NEWS_SOURCES.NYTIMES) && process.env.NYTIMES_API_KEY) {
      // NYT search implementation can be added here
    }

    // Polish RSS search
    const polishSourcesRequested = config.polishSources.some(s => isSourceRequested(s.id));
    if (polishSourcesRequested) {
      try {
        // Get all Polish news
        const polishNews = await fetchPolishNews();

        // Filter to only requested Polish sources if specific ones were requested
        const filteredPolishNews = sources.length > 0
          ? polishNews.filter(article => sourceSet.has(article.sourceId))
          : polishNews;

        // Simple keyword search - filter articles containing the query in title or description
        const matchingArticles = filteredPolishNews.filter(article => {
          const searchableText = `${article.title} ${article.description}`.toLowerCase();
          return searchableText.includes(query.toLowerCase());
        });

        results = [...results, ...matchingArticles];
      } catch (error) {
        console.error('Error searching Polish news:', error.message);
      }
    }

    // Major RSS search
    const majorSourcesRequested = config.majorSources.some(s => isSourceRequested(s.id));
    if (majorSourcesRequested) {
      try {
        // Get all major news
        const majorNews = await fetchMajorNews();

        // Filter to only requested major sources if specific ones were requested
        const filteredMajorNews = sources.length > 0
          ? majorNews.filter(article => sourceSet.has(article.sourceId))
          : majorNews;

        // Simple keyword search
        const matchingArticles = filteredMajorNews.filter(article => {
          const searchableText = `${article.title} ${article.description}`.toLowerCase();
          return searchableText.includes(query.toLowerCase());
        });

        results = [...results, ...matchingArticles];
      } catch (error) {
        console.error('Error searching Major RSS news:', error.message);
      }
    }

    // Apply deduplication to search results
    const dedupedResults = deduplicateNews(results);

    // Process with NLP features and clustering
    const processedResults = processNewsWithClustering(dedupedResults);

    // Cache the results
    setCache(cacheKey, processedResults, 5 * 60); // Cache for 5 minutes

    return processedResults;
  } catch (error) {
    console.error('Error searching news:', error);
    return {
      items: [],
      clusters: []
    };
  }
}

/**
 * Fetch news that are newer than a given timestamp
 * @param {Array} sources - Array of source IDs
 * @param {Date|string} timestamp - Timestamp to compare against
 * @param {Object} options - Options (translate, country)
 * @returns {Promise<Object>} - Latest news data with items and clusters
 */
async function fetchLatestNews(sources, timestamp, options = {}) {
  try {
    // Convert timestamp to Date if it's a string
    const compareDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // Validate timestamp
    if (isNaN(compareDate.getTime())) {
      console.error('Invalid timestamp provided:', timestamp);
      throw new Error('Invalid timestamp provided');
    }
    
    // Important: Instead of fetching filtered news, fetch ALL recent news first
    // This is more reliable than trying to filter by timestamp at the source
    const allNewsData = await fetchFromMultipleSources(sources, options);
    console.log(`Total fetched items before filtering: ${allNewsData.items.length}`);
    
    // Filter only items newer than the provided timestamp
    const latestItems = allNewsData.items.filter(item => {
      // Get publish date
      const publishDate = new Date(item.publishedAt);
      
      // Debug check
      if (isNaN(publishDate.getTime())) {
        console.log(`Invalid publish date for article: ${item.title}`);
        return false;
      }
      
      // Debug timestamp comparison
      const isNewer = publishDate > compareDate;
      if (isNewer) {
        console.log(`New article found: "${item.title.substring(0, 30)}..." - ${publishDate.toISOString()} > ${compareDate.toISOString()}`);
      }
      
      return isNewer;
    });
    
    console.log(`Found ${latestItems.length} new items since ${compareDate.toISOString()}`);
    
    // Return empty result if no new items
    if (latestItems.length === 0) {
      console.log('No new items found, returning empty result');
      return {
        items: [],
        clusters: []
      };
    }
    
    // Sort by publication date (newest first)
    latestItems.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    // Process with NLP and clustering if there are new items
    const processedNews = processNewsWithClustering(latestItems);
    return processedNews;
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return {
      items: [],
      clusters: []
    };
  }
}

module.exports = {
  fetchNewsFromSource,
  fetchFromMultipleSources,
  fetchNewsByCountry,
  fetchNewsByCategory, 
  searchNews,
  deduplicateNews,
  translateNewsTitles,
  fetchLatestNews
};