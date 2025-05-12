// server/services/rssService.js
const axios = require('axios');
const Parser = require('rss-parser');
const { v4: uuidv4 } = require('uuid');
const { getCache, setCache } = require('./cacheService');
const config = require('../config');

// Create a new parser with custom fields
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['description', 'description'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

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
 * Fetches and parses an RSS feed from a given URL
 * @param {string} url - The RSS feed URL
 * @param {string} sourceId - Unique identifier for the source
 * @param {string} sourceName - Display name of the source
 * @param {string} category - News category
 * @returns {Promise<Array>} - Array of parsed news items
 */
async function fetchRSSFeed(url, sourceId, sourceName, category) {
  const cacheKey = `rss_${sourceId}`;

  // Check cache first
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Some feeds might require specific headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      responseType: 'text',
      timeout: 10000 // 10 second timeout
    });

    // Parse the RSS XML
    const feed = await parser.parseString(response.data);
    console.log(`Successfully parsed feed: ${sourceName}, found ${feed.items?.length || 0} items`);

    // Transform the RSS items into the format expected by the news aggregator
    // Limit to 10 items per source
    const newsItems = feed.items.slice(0, 10).map(item => {
      // Extract image URL from different possible locations in the RSS
      let imageUrl = '';
    
      if (item.media && item.media.$ && item.media.$.url) {
        // media:content tag
        imageUrl = item.media.$.url;
      } else if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
        // media:thumbnail tag
        imageUrl = item.mediaThumbnail.$.url;
      } else if (item.enclosure && item.enclosure.$ && item.enclosure.$.url) {
        // enclosure tag
        imageUrl = item.enclosure.$.url;
      }
    
      // Store the full description for keyword extraction
      const fullDescription = item.contentSnippet || item.description || '';
      
      // Get the best content from available fields (for fulltext searching and keyword extraction)
      const fullContent = item.contentEncoded || item.content || fullDescription;
    
      // Truncate the description for display
      const truncatedDescription = truncateText(fullDescription);
      
      // Create a standardized news item
      return {
        id: `${sourceId}-${uuidv4().substring(0, 8)}`,
        title: item.title,
        source: sourceName,
        sourceId: sourceId,
        url: item.link,
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        author: item.creator || item.author || sourceName,
        description: truncatedDescription,
        fullDescription: fullDescription,
        fullContent: fullContent,
        imageUrl: imageUrl,
        content: truncateText(fullContent, 500),
        category: category || 'general',
        country: sourceId.includes('-pl') ? 'pl' : 'en'
      };
    });

    // Store in cache for 10 minutes
    setCache(cacheKey, newsItems, 10 * 60);

    return newsItems;
  } catch (error) {
    console.error(`Error fetching RSS feed for ${sourceName}:`, error.message);
    return [];
  }
}

/**
 * Fetches news from Polish RSS sources or a specific source
 * @param {string} sourceId - Optional specific source to fetch (if undefined, fetches all)
 * @returns {Promise<Array>} - Array of news items from all sources
 */
async function fetchPolishNews(sourceId) {
  try {
    let results = [];

    if (sourceId) {
      // Fetch from a specific source
      const source = config.polishSources.find(s => s.id === sourceId);
      if (source) {
        const items = await fetchRSSFeed(source.url, source.id, source.name, source.category);
        results = [...results, ...items];
      }
    } else {
      // Fetch from all sources
      const fetchPromises = config.polishSources.map(source =>
        fetchRSSFeed(source.url, source.id, source.name, source.category)
      );

      const newsArrays = await Promise.all(fetchPromises);
      results = newsArrays.flat();
    }

    // Sort by publication date (newest first)
    results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    return results;
  } catch (error) {
    console.error('Error fetching Polish news:', error);
    return [];
  }
}

/**
 * Fetches news from all major RSS sources or a specific source
 * @param {string} sourceId - Optional specific source to fetch (if undefined, fetches all)
 * @returns {Promise<Array>} - Array of news items from all sources
 */
async function fetchMajorNews(sourceId) {
  try {
    let results = [];

    if (sourceId) {
      // Fetch from a specific source
      const source = config.majorSources.find(s => s.id === sourceId);
      if (source) {
        const items = await fetchRSSFeed(source.url, source.id, source.name, source.category);
        results = [...results, ...items];
      }
    } else {
      // Fetch from all sources
      const fetchPromises = config.majorSources.map(source =>
        fetchRSSFeed(source.url, source.id, source.name, source.category)
      );

      const newsArrays = await Promise.all(fetchPromises);
      results = newsArrays.flat();
    }

    // Sort by publication date (newest first)
    results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    return results;
  } catch (error) {
    console.error('Error fetching major news:', error);
    return [];
  }
}

module.exports = {
  fetchRSSFeed,
  fetchPolishNews,
  fetchMajorNews,
  truncateText
};