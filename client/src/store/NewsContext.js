// client/src/store/NewsContext.js
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { deduplicateNews, loadFromStorage, saveToStorage } from '../utils/helpers';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';
import { newsService } from '../services/newsService';
import { SourceContext } from './SourceContext';

// Create context
export const NewsContext = createContext();

/**
 * News Context Provider Component
 */
export const NewsProvider = ({ children }) => {
  const { selectedSources } = useContext(SourceContext);
  
  // News state
  const [news, setNews] = useState({
    items: [],
    clusters: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Real-time news states
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(
    loadFromStorage(STORAGE_KEYS.AUTO_REFRESH_SETTING, DEFAULT_SETTINGS.autoRefreshEnabled)
  );
  const [newContentAvailable, setNewContentAvailable] = useState(false);
  const [newItems, setNewItems] = useState([]);
  const lastCheckedRef = useRef(new Date());
  
  // News settings
  const [translateToPolish, setTranslateToPolish] = useState(
    loadFromStorage(STORAGE_KEYS.TRANSLATE_SETTING, DEFAULT_SETTINGS.translateToPolish)
  );
  const [clusteringEnabled, setClusteringEnabled] = useState(
    loadFromStorage(STORAGE_KEYS.CLUSTERING_SETTING, DEFAULT_SETTINGS.clusteringEnabled)
  );
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);
  
  // Save auto-refresh setting to local storage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.AUTO_REFRESH_SETTING, autoRefreshEnabled);
  }, [autoRefreshEnabled]);
  
  // Fetch news when selected sources change or settings change
  useEffect(() => {
    if (selectedSources.length > 0) {
      fetchNews();
    }
  }, [selectedSources, translateToPolish]);
  
useEffect(() => {
    let intervalId;
  
  if (autoRefreshEnabled && selectedSources.length > 0 && !searchQuery && !activeCategory) {
        
    // Initial check right away
    checkForLatestNews();
    
    // Then set up the interval
    intervalId = setInterval(() => {
     
      checkForLatestNews();
    }, 60000); // 60 seconds
  }
  
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [autoRefreshEnabled, selectedSources, searchQuery, activeCategory]);
  
  // Auto-clear "new" indicators after 1 min
useEffect(() => {
  if (newItems.length > 0) {    
    const timeout = setTimeout(() => {
      clearNewContentIndicators();
    }, 60000); // 1 minute = 60000 ms 
    
    return () => {
      clearTimeout(timeout);
    };
  }
}, [newItems]);
  
/**
 * Fetch latest news since last check
 */
const checkForLatestNews = async () => {
  console.log('=== checkForLatestNews STARTED ===');
  console.log('Current time:', new Date().toLocaleTimeString());
  
  // Skip if no sources selected or if we're in search/category mode
  if (selectedSources.length === 0) {
    console.log('Skipping check - no sources selected');
    return;
  }
  
  if (activeCategory) {
    console.log('Skipping check - active category:', activeCategory);
    return;
  }
  
  if (searchQuery) {
    console.log('Skipping check - search query active:', searchQuery);
    return;
  }
  
  try {
    console.log('Checking for latest news since:', lastCheckedRef.current.toLocaleTimeString());
    console.log('Selected sources:', selectedSources.map(s => s.id).join(', '));
    
    // Get source IDs
    const sourceIds = selectedSources.map(source => source.id);
    
    // Call API with the timestamp of the last check
    console.log('Calling fetchLatestNews API...');
    const latestNews = await newsService.fetchLatestNews(sourceIds, lastCheckedRef.current, {
      translate: translateToPolish,
      country: activeCountry
    });
    
    // Update last checked timestamp
    const oldTime = lastCheckedRef.current;
   lastCheckedRef.current = new Date();
    
    // Check if there are genuinely new items (not demo items)
    // Backend is sending a "isDemoContent" flag when returning demo items
    const hasGenuineNewItems = latestNews.items && 
                              latestNews.items.length > 0 && 
                              !latestNews.isDemoContent;
    
    if (latestNews.items && latestNews.items.length > 0) {
      console.log(`Found ${latestNews.items.length} new articles${latestNews.isDemoContent ? ' (demo content)' : ''}`);
      
      // Mark new items
      const markedItems = latestNews.items.map(item => ({
        ...item,
        isNew: true
      }));
      
      // Add to new items list
      setNewItems(prevItems => [...markedItems, ...prevItems]);
      
      // Only show notification for genuine new content, not demo content
      if (hasGenuineNewItems) {
        setNewContentAvailable(true);
        console.log('New content notification enabled');
      } else {
        console.log('Demo content detected, not showing notification banner');
      }
      
      // Show notification
      setNewContentAvailable(true);
      console.log('New content notification enabled');
      
      // Update the main news list by ADDING new articles
      setNews(prevNews => {
        const existingIds = new Set(prevNews.items.map(item => item.id));
        
        // Filter out any duplicates from new items
        const uniqueNewItems = markedItems.filter(item => !existingIds.has(item.id));
        console.log(`Found ${uniqueNewItems.length} unique new items out of ${markedItems.length} total new items`);
        
        // If no unique new items, don't update state
        if (uniqueNewItems.length === 0) {
          console.log('No unique new items to add, keeping current state');
          return prevNews;
        }
        
        // Combine new items with existing items
        const updatedItems = [...uniqueNewItems, ...prevNews.items];
        
        return {
          items: updatedItems,
          clusters: prevNews.clusters // Keep existing clusters
        };
      });
      
      console.log('News state update requested');
    } else {
      console.log('No new articles found in API response');
    }
  } catch (err) {
    console.error('Error checking for latest news:', err);
  }
  
  console.log('=== checkForLatestNews COMPLETED ===');
};

// Also update this function to make sure it doesn't remove articles
const clearNewContentIndicators = () => {
  console.log('Clearing all new content indicators');
  
  // Clear new items list (but don't remove the articles themselves)
  setNewItems([]);
  
  // Hide notification
  setNewContentAvailable(false);
  
  // Update news items to remove isNew flag but keep all items
  setNews(prevNews => ({
    ...prevNews,
    items: prevNews.items.map(item => ({
      ...item,
      isNew: false
    }))
  }));
};
   
  /**
   * Clear "new" indicator for a specific item
   */
  const clearItemNewIndicator = (itemId) => {
    console.log('Clearing new indicator for item:', itemId);
    
    // Update the new items list
  setNewItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      console.log(`Removed item from newItems: ${prevItems.length} -> ${updatedItems.length}`);
      
      // If no more new items, hide notification banner
      if (updatedItems.length === 0) {
        setNewContentAvailable(false);
      }
      
      return updatedItems;
    });
    
    // Update news items to remove isNew flag for this item
    setNews(prevNews => ({
        ...prevNews,
        items: prevNews.items.map(item => 
          item.id === itemId ? { ...item, isNew: false } : item
        )
      }));
    
    // Hide the notification if no more new items
    if (newItems.length <= 1) {
      setNewContentAvailable(false);
    }
  };
  
  /**
   * Toggle auto-refresh feature
   */
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(prev => !prev);
  };
  
  // Save settings to local storage when they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TRANSLATE_SETTING, translateToPolish);
  }, [translateToPolish]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CLUSTERING_SETTING, clusteringEnabled);
  }, [clusteringEnabled]);
  
  /**
   * Fetch news from selected sources
   */
  const fetchNews = async () => {
    // Skip if no sources selected or if we're in search/category mode
    if (selectedSources.length === 0 || activeCategory || searchQuery) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get source IDs
      const sourceIds = selectedSources.map(source => source.id);
      
      // Call API
      const response = await newsService.fetchNews(sourceIds, {
        translate: translateToPolish,
        country: activeCountry
      });
      
      // Reset last checked timestamp when we fetch new news
      lastCheckedRef.current = new Date();
      console.log('Reset last checked time:', lastCheckedRef.current);
      
      // Clear any pending new items
      setNewItems([]);
      setNewContentAvailable(false);
      
      // Set state with response
      setNews(response);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again.');
      setNews({ items: [], clusters: [] });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fetch news by category
   * @param {string} category - Category to fetch
   */
  const fetchNewsByCategory = async (category) => {
    setLoading(true);
    setError(null);
    setActiveCategory(category);
    setSearchQuery('');
    
    try {
      const data = await newsService.fetchNewsByCategory(category, activeCountry);
      
      // Convert array response to expected format
      const dedupedItems = deduplicateNews(data);
      
      setNews({
        items: dedupedItems,
        clusters: [] // No clusters for category view
      });
    } catch (err) {
      console.error(`Error fetching ${category} news:`, err);
      setError(`Failed to load ${category} news. Please try again.`);
      setNews({ items: [], clusters: [] });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Search news across selected sources
   * @param {string} query - Search query
   */
  const searchNews = async (query) => {
    if (!query.trim()) {
      clearSearch();
      return;
    }
    
    setLoading(true);
    setError(null);
    setSearchQuery(query);
    setActiveCategory(null);
    
    try {
      // Check if there are any sources to search in
      if (selectedSources.length === 0) {
        throw new Error('Please select at least one news source to search within.');
      }
      
      // Get source IDs
      const sourceIds = selectedSources.map(source => source.id);
      
      // Call API
      const response = await newsService.searchNews(
        query, 
        sourceIds, 
        activeCountry
      );
      
      setNews(response);
      
      // Show error if no results
      if (response.items.length === 0) {
        setError(`No results found for "${query}" in the selected sources.`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed. Please try again.');
      setNews({ items: [], clusters: [] });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Clear search query and reload default news
   */
  const clearSearch = () => {
    setSearchQuery('');
    setActiveCategory(null);
    fetchNews();
  };
  
  /**
   * Set active country for filtering
   * @param {string} country - Country code
   */
  const setCountry = (country) => {
    setActiveCountry(country);
    
    // Reload news with the new country
    if (activeCategory) {
      fetchNewsByCategory(activeCategory);
    } else if (searchQuery) {
      searchNews(searchQuery);
    } else {
      fetchNews();
    }
  };
  
  // Context value
  const contextValue = {
    news,
    loading,
    error,
    searchQuery,
    activeCategory,
    activeCountry,
    translateToPolish,
    clusteringEnabled,
    autoRefreshEnabled,
    newContentAvailable,
    lastChecked: lastCheckedRef.current,
    setTranslateToPolish,
    setClusteringEnabled,
    toggleAutoRefresh,
    fetchNews,
    fetchNewsByCategory,
    searchNews,
    clearSearch,
    setCountry,
    clearNewContentIndicators,
    clearItemNewIndicator,
    checkForLatestNews
  };
  
  return (
    <NewsContext.Provider value={contextValue}>
      {children}
    </NewsContext.Provider>
  );
};

export default NewsContext;