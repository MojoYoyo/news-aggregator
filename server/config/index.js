// server/config/index.js
const path = require('path');
const fs = require('fs');

// Load RSS sources from JSON files
let polishSources = [];
let majorSources = [];

try {
  const polishSourcesPath = path.join(__dirname, 'polish-rss-sources.json');
  const majorSourcesPath = path.join(__dirname, 'major-rss-sources.json');

  // Check if the files exist
  if (fs.existsSync(polishSourcesPath)) {
    const polishSourcesData = fs.readFileSync(polishSourcesPath, 'utf8');
    polishSources = JSON.parse(polishSourcesData);
    console.log(`Loaded ${polishSources.length} Polish RSS sources`);
  } else {
    console.error(`Polish RSS sources file not found: ${polishSourcesPath}`);
  }

  if (fs.existsSync(majorSourcesPath)) {
    const majorSourcesData = fs.readFileSync(majorSourcesPath, 'utf8');
    majorSources = JSON.parse(majorSourcesData);
    console.log(`Loaded ${majorSources.length} Major RSS sources`);
  } else {
    console.error(`Major RSS sources file not found: ${majorSourcesPath}`);
  }
} catch (error) {
  console.error('Error loading RSS sources from JSON files:', error);
}

// Categories mapping for UI display
const categories = {
  general: 'General',
  business: 'Business',
  entertainment: 'Entertainment',
  health: 'Health',
  science: 'Science',
  sports: 'Sports',
  technology: 'Technology',
  politics: 'Politics',
  culture: 'Culture',
  world: 'World News',
  environment: 'Environment',
  education: 'Education'
};

// Available countries for NewsAPI
const countries = {
  ALL: 'all',
  POLAND: 'pl',
  USA: 'us',
  UK: 'gb',
  GERMANY: 'de',
  FRANCE: 'fr'
};

// Configuration object
const config = {
  polishSources,
  majorSources,
  categories,
  countries,
  api: {
    cacheEnabled: process.env.ENABLE_API_CACHE !== 'false',
    defaultCacheTtl: 60 * 10, // 10 minutes
    newsApiKey: process.env.NEWS_API_KEY,
    guardianApiKey: process.env.GUARDIAN_API_KEY,
    nytimesApiKey: process.env.NYTIMES_API_KEY
  },
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  }
};

module.exports = config;