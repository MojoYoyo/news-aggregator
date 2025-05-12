// client/src/App.js
import React from 'react';
import Home from './pages/Home/Home';
import { SourceProvider } from './store/SourceContext';
import { NewsProvider } from './store/NewsContext';
import './App.module.css';

/**
 * Main App component
 */
const App = () => {
  return (
    <SourceProvider>
      <NewsProvider>
        <Home />
      </NewsProvider>
    </SourceProvider>
  );
};

export default App;