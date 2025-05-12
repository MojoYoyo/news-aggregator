// client/src/hooks/useSearch.js
import { useState } from 'react';
import useNews from './useNews';

/**
 * Custom hook for handling search functionality
 * @returns {Object} Search state and methods
 */
const useSearch = () => {
  const { searchNews, clearSearch } = useNews();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  /**
   * Handle search form submission
   * @param {Event} e - Form event
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    
    const query = searchQuery.trim();
    if (!query) return;
    
    setIsSearching(true);
    await searchNews(query);
    setIsSearching(false);
  };
  
  /**
   * Clear search and reset state
   */
  const handleClearSearch = () => {
    setSearchQuery('');
    clearSearch();
  };
  
  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    handleSearch,
    handleClearSearch
  };
};

export default useSearch;