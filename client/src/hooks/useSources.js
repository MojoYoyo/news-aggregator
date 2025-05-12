// client/src/hooks/useSources.js
import { useContext } from 'react';
import { SourceContext } from '../store/SourceContext';

/**
 * Custom hook for accessing sources data and methods
 * @returns {Object} Source context values and methods
 */
const useSources = () => {
  const context = useContext(SourceContext);
  
  if (context === undefined) {
    throw new Error('useSources must be used within a SourceProvider');
  }
  
  return context;
};

export default useSources;