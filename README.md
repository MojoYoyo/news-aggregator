# News Aggregator

A global news aggregator application with clean architecture that aggregates news from various sources, including Polish RSS feeds, international news APIs, and more.

## Architecture

This project follows a clean architecture approach with clear separation of concerns:

### Frontend (React)
- **Components**: Reusable UI components
- **Pages**: Page components that use multiple UI components
- **Services**: API communication layer
- **Hooks**: Custom React hooks for state and business logic
- **Store**: Context-based state management
- **Utils**: Utility functions

### Backend (Node.js/Express)
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and external API integration
- **Models**: Data models and validation
- **Routes**: API route definitions
- **Middleware**: Request processing middleware
- **Config**: Application configuration
- **Utils**: Utility functions

## Features

- Aggregates news from multiple sources (APIs and RSS feeds)
- News clustering to group similar stories
- Source filtering and selection
- Category and country filtering
- Sentiment analysis for news items
- Translation capability (Polish/English)
- Responsive design
- Caching for improved performance

## Setup and Installation

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/news-aggregator.git
cd news-aggregator
```

2. Install dependencies for both frontend and backend:
```bash
npm run install:all
```

3. Create a `.env` file in the server directory with the following variables:
```
NEWS_API_KEY=your_news_api_key
GUARDIAN_API_KEY=your_guardian_api_key
NYTIMES_API_KEY=your_nytimes_api_key
ADMIN_API_KEY=your_admin_key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
ENABLE_API_CACHE=true
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` for the client and `http://localhost:5000` for the API.

## API Endpoints

### News
- `POST /api/news` - Get news from selected sources
- `GET /api/news/category/:category` - Get news by category
- `GET /api/news/country/:country` - Get news by country
- `GET /api/news/polish` - Get news from Polish sources
- `GET /api/news/search` - Search news

### Sources
- `GET /api/sources` - Get all available sources
- `GET /api/sources/countries` - Get available countries
- `POST /api/sources/reload` - Reload RSS sources (admin)

### Health
- `GET /api/health` - Get API health status
- `POST /api/health/clear-cache` - Clear cache (admin)

## Deployment

To build for production:

```bash
npm run build
```

This will create a production build of the client and server.

## License

MIT