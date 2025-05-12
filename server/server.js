// server/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Configure dotenv with explicit path and debug
const envPath = path.resolve(__dirname, '.env');

// Load environment variables with explicit path
dotenv.config({ path: envPath });

// Log loaded environment variables (without showing the actual values)
Object.keys(process.env).forEach(key => {
  if (key.includes('API_KEY') || key.includes('KEY')) {
  }
});

// Import routes
const newsRoutes = require('./routes/newsRoutes');
const sourceRoutes = require('./routes/sourceRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Create Express app
const app = express();

// Configure middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Define API routes
app.use('/api/news', newsRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/health', healthRoutes);

if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // For any route that is not an API route, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// IMPORTANT: Add this route to handle the countries endpoint directly
app.get('/api/countries', (req, res) => {
  res.json([
    { code: 'all', name: 'All Countries' },
    { code: 'pl', name: 'Poland' },
    { code: 'us', name: 'USA' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'de', name: 'Germany' },
    { code: 'fr', name: 'France' }
  ]);
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Set port and start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const newPort = PORT + 1;
    console.log(`Port ${PORT} is busy. Trying port ${newPort}...`);
    server.close();
    app.listen(newPort, () => {
      console.log(`Server running on port ${newPort}`);
    });
  } else {
    console.error(err);
  }
});

// For testing
module.exports = server;