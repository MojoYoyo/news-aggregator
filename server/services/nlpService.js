// server/services/nlpService.js
const natural = require('natural');
const Sentiment = require('sentiment');
const englishSentiment = new Sentiment();
const sw = require('stopword');
const stringSimilarity = require('string-similarity');

// Polish stopwords - basic set
const polishStopwords = [
  'a', 'aby', 'ach', 'acz', 'aczkolwiek', 'aj', 'albo', 'ale', 'ależ', 'ani', 'aż', 'bardziej', 'bardzo', 'bez', 'bo',
  'bowiem', 'by', 'byli', 'bynajmniej', 'być', 'był', 'była', 'było', 'były', 'będzie', 'będą', 'cali', 'cała',
  'cały', 'ci', 'cię', 'ciebie', 'co', 'cokolwiek', 'coś', 'czasami', 'czasem', 'czemu', 'czy', 'czyli', 'daleko',
  'dla', 'dlaczego', 'dlatego', 'do', 'dobrze', 'dokąd', 'dość', 'dużo', 'dwa', 'dwaj', 'dwie', 'dwoje', 'dziś',
  'dzisiaj', 'gdy', 'gdyby', 'gdyż', 'gdzie', 'gdziekolwiek', 'gdzieś', 'go', 'i', 'ich', 'ile', 'im', 'inna',
  'inne', 'inny', 'innych', 'iż', 'ja', 'ją', 'jak', 'jakaś', 'jakby', 'jaki', 'jakichś', 'jakie', 'jakiś', 'jakiż',
  'jakkolwiek', 'jako', 'jakoś', 'je', 'jeden', 'jedna', 'jedno', 'jednak', 'jednakże', 'jego', 'jej', 'jemu',
  'jest', 'jestem', 'jeszcze', 'jeśli', 'jeżeli', 'już', 'ją', 'każdy', 'kiedy', 'kilka', 'kimś', 'kto', 'ktokolwiek',
  'ktoś', 'która', 'które', 'którego', 'której', 'który', 'których', 'którym', 'którzy', 'ku', 'lat', 'lecz',
  'lub', 'ma', 'mają', 'mało', 'mam', 'mi', 'mimo', 'między', 'mną', 'mnie', 'mogą', 'moi', 'moim', 'moja', 'moje',
  'może', 'możliwe', 'można', 'mój', 'mu', 'my', 'na', 'nad', 'nam', 'nami', 'nas', 'nasi', 'nasz', 'nasza', 'nasze',
  'naszego', 'naszych'
];

// Basic Polish sentiment dictionaries
const polishPositiveWords = [
  'dobry', 'wspaniały', 'świetny', 'fantastyczny', 'pozytywny', 'doskonały', 'znakomity', 'wybitny', 'udany', 
  'sukces', 'zwycięstwo', 'korzyść', 'wspaniałomyślny', 'szczęśliwy', 'zadowolony', 'radosny', 'super', 
  'fajny', 'rewelacyjny', 'pomyślny', 'korzystny', 'dogodny', 'pomyślnie', 'dobrze', 'przyjazny'
];

const polishNegativeWords = [
  'zły', 'niedobry', 'fatalny', 'straszny', 'okropny', 'koszmarny', 'negatywny', 'niekorzystny', 
  'przeciwny', 'szkodliwy', 'niepożądany', 'niepomyślny', 'nieodpowiedni', 'nieszczęśliwy', 'smutny', 
  'przygnębiający', 'porażka', 'przegrana', 'kryzys', 'problem', 'konflikt', 'wojna', 'skandal'
];

// TF-IDF setup for keyword extraction
const TfIdf = natural.TfIdf;

/**
 * Detects if text is likely to be in Polish
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if likely Polish
 */
const isPolishText = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Check for Polish-specific characters
  const polishChars = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
  
  // Check proportion of words that are Polish stopwords
  const words = text.toLowerCase().split(/\s+/);
  const polishStopwordCount = words.filter(word => polishStopwords.includes(word)).length;
  const stopwordRatio = polishStopwordCount / words.length;
  
  return polishChars.test(text) || stopwordRatio > 0.2;
};

/**
 * Analyzes text sentiment with language detection
 * @param {string} text - The text to analyze
 * @returns {Object} - Sentiment data: {score, comparative, assessment, language}
 */
const analyzeSentiment = (text) => {
  if (!text || typeof text !== 'string') {
    return { score: 0, comparative: 0, assessment: 'neutral', language: 'unknown' };
  }

  // Detect if text is in Polish
  const isPolish = isPolishText(text);
  
  let score = 0;
  let comparative = 0;
  
  if (isPolish) {
    // Custom Polish sentiment analysis
    const lowercaseText = text.toLowerCase();
    const words = lowercaseText.split(/\s+/);
    
    const positiveMatches = words.filter(word => 
      polishPositiveWords.some(positive => word.includes(positive))
    ).length;
    
    const negativeMatches = words.filter(word => 
      polishNegativeWords.some(negative => word.includes(negative))
    ).length;
    
    score = positiveMatches - negativeMatches;
    comparative = words.length > 0 ? score / words.length : 0;
  } else {
    // Use English sentiment analysis
    const result = englishSentiment.analyze(text);
    score = result.score;
    comparative = result.comparative;
  }
  
  // Determine sentiment category
  let assessment = 'neutral';
  if (comparative > 0.05) assessment = 'positive';
  else if (comparative < -0.05) assessment = 'negative';
  
  return {
    score,
    comparative,
    assessment,
    language: isPolish ? 'pl' : 'en'
  };
};

/**
 * Extract entities (proper nouns, capitalized words) from text
 * @param {string} text - Text to extract entities from
 * @returns {Array<string>} - Array of entities
 */
function extractEntities(text) {
  if (!text) return [];
  
  // Simple entity extraction - look for capitalized words not at the start of sentences
  const entities = [];
  
  // First split into sentences
  const sentences = text.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    // Skip empty sentences
    if (!sentence.trim()) return;
    
    // Get words (excluding the first word of the sentence)
    const words = sentence.trim().split(/\s+/);
    if (words.length <= 1) return;
    
    // Check remaining words for capitalization (potential entities)
    for (let i = 1; i < words.length; i++) {
      const word = words[i].trim();
      if (word.length > 3 && /^[A-ZĘÓĄŚŁŻŹĆŃ]/.test(word)) {
        // Remove any trailing punctuation
        const cleanWord = word.replace(/[,;:)\]"']$/, '');
        entities.push(cleanWord);
      }
    }
  });
  
  // Also extract the first word of each sentence if it's unusually long (likely not just "The", "A", etc.)
  sentences.forEach(sentence => {
    const words = sentence.trim().split(/\s+/);
    if (words.length === 0) return;
    
    const firstWord = words[0].trim();
    if (firstWord.length > 6 && /^[A-ZĘÓĄŚŁŻŹĆŃ]/.test(firstWord)) {
      const cleanWord = firstWord.replace(/[,;:)\]"']$/, '');
      entities.push(cleanWord);
    }
  });
  
  return [...new Set(entities)]; // Remove duplicates
}

/**
 * Calculate similarity between two sets of entities
 * @param {Array<string>} entities1 - First set of entities
 * @param {Array<string>} entities2 - Second set of entities
 * @returns {number} - Similarity score (0-1)
 */
function calculateEntitySimilarity(entities1, entities2) {
  if (!entities1.length || !entities2.length) return 0;
  
  // Calculate Jaccard similarity: size of intersection / size of union
  const intersection = entities1.filter(entity => 
    entities2.some(e => e === entity || e.includes(entity) || entity.includes(e))
  );
  
  const union = [...new Set([...entities1, ...entities2])];
  
  return intersection.length / union.length;
}

/**
 * Calculate text similarity between two articles
 * @param {object} article1 - First article
 * @param {object} article2 - Second article
 * @returns {number} - Similarity score (0-1)
 */
function calculateArticleSimilarity(article1, article2) {
  // Detect language
  const text1 = `${article1.title || ''} ${article1.description || ''}`;
  const text2 = `${article2.title || ''} ${article2.description || ''}`;
  
  const isArticle1Polish = isPolishText(text1);
  const isArticle2Polish = isPolishText(text2);
  
  // If articles are in different languages, they're less likely to be about the same story
  if (isArticle1Polish !== isArticle2Polish) {
    // Focus more on entity matching in this case
    const entities1 = extractEntities(text1);
    const entities2 = extractEntities(text2);
    return calculateEntitySimilarity(entities1, entities2) * 0.7;
  }
  
  // For same-language articles, use a combination of techniques
  
  // 1. Title similarity has high weight
  const titleSimilarity = stringSimilarity.compareTwoStrings(
    article1.title || '', 
    article2.title || ''
  );
  
  // 2. Entity overlap also has high weight
  const entities1 = extractEntities(text1);
  const entities2 = extractEntities(text2);
  const entitySimilarity = calculateEntitySimilarity(entities1, entities2);
  
  // 3. Overall text similarity has lower weight
  const textSimilarity = stringSimilarity.compareTwoStrings(text1, text2);
  
  // Weighted combination, prioritizing title and entities
  return (titleSimilarity * 0.5) + (entitySimilarity * 0.3) + (textSimilarity * 0.2);
}

/**
 * Check if two articles were published within a specific time window
 * @param {object} article1 - First article
 * @param {object} article2 - Second article
 * @param {number} hoursWindow - Maximum time difference in hours
 * @returns {boolean} - True if within time window
 */
function isWithinTimeWindow(article1, article2, hoursWindow = 24) {
  const date1 = new Date(article1.publishedAt);
  const date2 = new Date(article2.publishedAt);
  
  const timeDiffMs = Math.abs(date1 - date2);
  const hoursDiff = timeDiffMs / (1000 * 60 * 60);
  
  return hoursDiff <= hoursWindow;
}

/**
 * Cluster news articles into stories
 * @param {Array} articles - Array of news articles
 * @param {number} similarityThreshold - Minimum similarity to consider articles related (0-1)
 * @param {number} timeWindowHours - Maximum time difference between related articles in hours
 * @returns {Array} - Array of clusters, where each cluster is an array of related articles
 */
function clusterStoriesByContent(articles, similarityThreshold = 0.4, timeWindowHours = 48) {
  if (!articles || articles.length === 0) {
    return [];
  }
  
  // First enhance articles with entities
  const enhancedArticles = articles.map(article => {
    const text = `${article.title || ''} ${article.description || ''}`;
    const entities = extractEntities(text);
    return {
      ...article,
      entities
    };
  });
  
  // Sort by date (newest first) to prioritize recent articles as cluster leaders
  const sortedArticles = [...enhancedArticles].sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );
  
  const clusters = [];
  const processed = new Set();
  
  // Create clusters
  for (const article of sortedArticles) {
    // Skip if already in a cluster
    if (processed.has(article.id)) continue;
    
    // Start a new cluster with this article
    const cluster = [article];
    processed.add(article.id);
    
    // Find similar articles for this cluster
    for (const candidate of sortedArticles) {
      if (processed.has(candidate.id) || candidate.id === article.id) continue;
      
      const timeMatch = isWithinTimeWindow(article, candidate, timeWindowHours);
      if (!timeMatch) continue; // Skip if outside time window
      
      const similarity = calculateArticleSimilarity(article, candidate);
      
      if (similarity >= similarityThreshold) {
        cluster.push(candidate);
        processed.add(candidate.id);
      }
    }
    
    // Only consider it a proper cluster if it has multiple articles
    if (cluster.length > 1) {
      clusters.push(cluster);
    } else {
      // Single articles are treated as their own "clusters"
      clusters.push([article]);
    }
  }
  
  return clusters;
}

/**
 * Enhances news items with NLP features (sentiment analysis)
 * @param {Array} newsItems - Raw news items to enhance
 * @returns {Array} - Enhanced news items with sentiment and language info
 */
function enhanceNewsItems(newsItems) {
  return newsItems.map(item => {
    // Make sure we have text to analyze
    const title = item.title || '';
    const description = item.description || '';
    
    // For sentiment analysis, combine the text
    const combinedText = `${title} ${description}`;
    
    // Detect language
    const isPolish = isPolishText(combinedText);
    
    // Add sentiment analysis
    const sentimentResult = analyzeSentiment(combinedText);
    
    // Return enhanced item
    return {
      ...item,
      sentiment: sentimentResult,
      detectedLanguage: isPolish ? 'pl' : 'en'
    };
  });
}

/**
 * Process news items and create story clusters
 * @param {Array} newsItems - News items
 * @returns {Object} - Contains both clusters and original items
 */
function processNewsWithClustering(newsItems) {
  try {
    // First enhance with NLP features
    const enhancedItems = enhanceNewsItems(newsItems);
    
    // Create clusters
    const clusters = clusterStoriesByContent(enhancedItems);
    
    // Return both the clusters and enhanced items
    return {
      clusters: clusters,
      items: enhancedItems
    };
  } catch (error) {
    console.error('Error in processNewsWithClustering:', error);
    return {
      clusters: [],
      items: Array.isArray(newsItems) ? newsItems : []
    };
  }
}

module.exports = {
  analyzeSentiment,
  isPolishText,
  extractEntities,
  calculateArticleSimilarity,
  clusterStoriesByContent,
  enhanceNewsItems,
  processNewsWithClustering
};