// client/src/components/SourceSearch/SourceSearch.js
import React from 'react';
import useSources from '../../hooks/useSources';
import styles from './SourceSearch.module.css';

/**
 * Component for searching news sources
 */
const SourceSearch = () => {
  const { sourceSearchTerm, setSourceSearchTerm } = useSources();
  
  return (
    <div className={styles.sourceSearch}>
      <input
        type="text"
        placeholder="Search sources..."
        value={sourceSearchTerm}
        onChange={(e) => setSourceSearchTerm(e.target.value)}
        className={styles.input}
        aria-label="Search sources"
      />
      
      {sourceSearchTerm && (
        <button 
          className={styles.clearButton} 
          onClick={() => setSourceSearchTerm('')}
          aria-label="Clear search"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
};

export default SourceSearch;