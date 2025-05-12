// client/src/hooks/useNews.js
import { useContext } from 'react';
import { NewsContext } from '../store/NewsContext';

/**
 * Custom hook for accessing news data and methods
 * @returns {Object} News context values and methods
 */
const useNews = () => {
  const context = useContext(NewsContext);
  
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  
  return context;
};

export default useNews;