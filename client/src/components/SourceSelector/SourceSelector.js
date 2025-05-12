// client/src/components/SourceSelector/SourceSelector.js
import React, { useState } from 'react';
import useSources from '../../hooks/useSources';
import { SOURCE_CATEGORIES } from '../../utils/constants';
import { capitalizeFirstLetter } from '../../utils/formatters';
import styles from './SourceSelector.module.css';

/**
 * Component for selecting news sources
 */
const SourceSelector = () => {
  const {
    groupedSources,
    selectedSources,
    toggleSource,
    toggleCategorySelection
  } = useSources();

  // Track which categories are collapsed
  const [collapsedCategories, setCollapsedCategories] = useState({});

  /**
   * Toggle a category's collapsed state
   * @param {string} category - Category name
   */
  const toggleCategoryCollapse = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  /**
   * Check if all sources in a category are selected
   * @param {string} category - Category name
   * @param {Array} sourcesInCategory - Sources in the category
   * @returns {boolean} - Whether all sources are selected
   */
  const areAllSourcesSelected = (category, sourcesInCategory) => {
    if (!sourcesInCategory || sourcesInCategory.length === 0) return false;

    return sourcesInCategory.every(source =>
      selectedSources.some(s => s.id === source.id)
    );
  };

  // If no sources data, show loading state
  if (!groupedSources || Object.keys(groupedSources).length === 0) {
    return <div className={styles.loading}>Loading sources...</div>;
  }

  return (
    <nav className={styles.sourceSelector}>
      <h2 className={styles.title}>News Sources</h2>

      {/* Categories */}
      {Object.entries(groupedSources).map(([category, sourcesInCategory]) => {
        // Skip rendering if no sources in category
        if (!sourcesInCategory || sourcesInCategory.length === 0) return null;

        const isCollapsed = collapsedCategories[category];
        const allSelected = areAllSourcesSelected(category, sourcesInCategory);
        const selectedCount = sourcesInCategory.filter(source =>
          selectedSources.some(s => s.id === source.id)
        ).length;

        return (
          <div key={category} className={styles.category}>
            {/* Category header */}
            <div className={styles.categoryHeader}>
              <button
                type="button"
                className={styles.collapseButton}
                onClick={() => toggleCategoryCollapse(category)}
                aria-expanded={!isCollapsed}
              >
                <span className={`${styles.collapseIcon} ${isCollapsed ? styles.collapsed : ''}`}>
                  {isCollapsed ? '►' : '▼'}
                </span>

                <span className={styles.categoryName}>
                  {SOURCE_CATEGORIES[category] || capitalizeFirstLetter(category)}
                </span>

                <span className={styles.selectionCount}>
                  ({selectedCount}/{sourcesInCategory.length})
                </span>
              </button>

              {/* Select All button */}
              <button
                type="button"
                className={`${styles.selectAllButton} ${allSelected ? styles.allSelected : ''}`}
                onClick={() => toggleCategorySelection(category)}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Source list */}
            <div className={`${styles.sourceListContainer} ${isCollapsed ? styles.collapsed : ''}`}>
              <ul className={styles.sourceList}>
                {sourcesInCategory
                  .slice() // Create a copy to avoid mutating the original array
                  .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name
                  .map(source => (
                    <li key={source.id} className={styles.sourceItem}>
                      <label
                        className={`${styles.sourceLabel} ${selectedSources.some(s => s.id === source.id) ? styles.selected : ''
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSources.some(s => s.id === source.id)}
                          onChange={() => toggleSource(source.id)}
                        />
                        {source.name}
                      </label>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        );
      })}
    </nav>
  );
};

export default SourceSelector;