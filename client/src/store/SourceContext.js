// client/src/store/SourceContext.js
import React, { createContext, useState, useEffect } from 'react';
import { sourceService } from '../services/sourceService';
import { loadFromStorage, saveToStorage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

// Create context
export const SourceContext = createContext();

/**
 * Source Context Provider Component
 */
export const SourceProvider = ({ children }) => {
  // Sources state
  const [sources, setSources] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Source search state
  const [sourceSearchTerm, setSourceSearchTerm] = useState('');
  
  // Load sources and countries on component mount
  useEffect(() => {
    fetchSources();
    fetchCountries();
  }, []);
  
  /**
   * Fetch all available sources
   */
  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await sourceService.fetchSources();
      
      // Flatten the categorized sources
      const allSources = Object.entries(data).flatMap(([category, sourcesList]) =>
        sourcesList.map(source => ({
          ...source,
          category
        }))
      );
      
      setSources(allSources);
      
      // Load selected sources from storage, or default to Polish sources
      const savedSources = loadFromStorage(STORAGE_KEYS.SELECTED_SOURCES, null);
      
      if (savedSources) {
        // Match saved IDs with full source objects
        const fullSelectedSources = savedSources
          .map(savedId => allSources.find(s => s.id === savedId))
          .filter(Boolean); // Remove any nulls
        
        setSelectedSources(fullSelectedSources);
      } else {
        // Default to Polish sources if no saved selection
        const polishSources = allSources.filter(source => source.category === 'polish');
        setSelectedSources(polishSources);
      }
    } catch (err) {
      console.error('Error fetching sources:', err);
      setError('Failed to load news sources. Please try again later.');
      
      // Set fallback sources in case of API failure
      const fallbackSources = [
        { id: 'businessinsider-pl', name: 'Business Insider Polska', category: 'polish' },
        { id: 'rmf24', name: 'RMF 24', category: 'polish' },
        { id: 'tvn24-najnowsze', name: 'TVN 24 Najnowsze', category: 'polish' },
        { id: 'guardian', name: 'The Guardian', category: 'major_api' },
        { id: 'nytimes', name: 'The New York Times', category: 'major_api' },
        { id: 'bbc-news', name: 'BBC News', category: 'major_api' }
      ];
      
      setSources(fallbackSources);
      setSelectedSources(fallbackSources.filter(s => s.category === 'polish'));
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fetch available countries
   */
  const fetchCountries = async () => {
    try {
      const data = await sourceService.fetchCountries();
      setCountries(data);
    } catch (err) {
      console.error('Error fetching countries:', err);
      
      // Set fallback countries
      setCountries([
        { code: 'all', name: 'All Countries' },
        { code: 'pl', name: 'Poland' },
        { code: 'us', name: 'USA' }
      ]);
    }
  };
  
  /**
   * Toggle selection of a source
   * @param {string} sourceId - ID of source to toggle
   */
  const toggleSource = (sourceId) => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) return;
    
    setSelectedSources(prev => {
      // Check if already selected
      const isSelected = prev.some(s => s.id === sourceId);
      
      // Create new array
      const newSelection = isSelected
        ? prev.filter(s => s.id !== sourceId) // FIXED: Remove if already selected
        : [...prev, source]; // Add if not selected
      
      // Save to storage
      saveToStorage(
        STORAGE_KEYS.SELECTED_SOURCES, 
        newSelection.map(s => s.id)
      );
      
      return newSelection;
    });
  };
  
  /**
   * Toggle all sources in a category
   * @param {string} category - Category to toggle
   */
  const toggleCategorySelection = (category) => {
    // Get all sources in the category
    const categorySources = sources.filter(s => s.category === category);
    const categoryIds = categorySources.map(s => s.id);
    
    // Check if all sources in category are already selected
    const allSelected = categoryIds.every(id => 
      selectedSources.some(s => s.id === id)
    );
    
    if (allSelected) {
      // Remove all sources in category
      setSelectedSources(prev => {
        const newSelection = prev.filter(s => !categoryIds.includes(s.id));
        
        // Save to storage
        saveToStorage(
          STORAGE_KEYS.SELECTED_SOURCES, 
          newSelection.map(s => s.id)
        );
        
        return newSelection;
      });
    } else {
      // Add all sources in category that aren't already selected
      setSelectedSources(prev => {
        // Find which sources need to be added
        const sourcesToAdd = categorySources.filter(
          source => !prev.some(s => s.id === source.id)
        );
        
        const newSelection = [...prev, ...sourcesToAdd];
        
        // Save to storage
        saveToStorage(
          STORAGE_KEYS.SELECTED_SOURCES, 
          newSelection.map(s => s.id)
        );
        
        return newSelection;
      });
    }
  };
  
  // Compute filtered and grouped sources
  const filteredSources = sourceSearchTerm
    ? sources.filter(source => 
        source.name.toLowerCase().includes(sourceSearchTerm.toLowerCase())
      )
    : sources;
    
  const groupedSources = filteredSources.reduce((acc, source) => {
    if (!acc[source.category]) {
      acc[source.category] = [];
    }
    acc[source.category].push(source);
    return acc;
  }, {});
  
  // Context value
  const contextValue = {
    sources,
    selectedSources,
    groupedSources,
    countries,
    loading,
    error,
    sourceSearchTerm,
    setSourceSearchTerm,
    toggleSource,
    toggleCategorySelection,
    fetchSources
  };
  
  return (
    <SourceContext.Provider value={contextValue}>
      {children}
    </SourceContext.Provider>
  );
};

export default SourceContext;