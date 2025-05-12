// client/src/pages/Home/Home.js
import React from 'react';
import NewsList from '../../components/NewsList/NewsList';
import SourceSelector from '../../components/SourceSelector/SourceSelector';
import SourceSearch from '../../components/SourceSearch/SourceSearch';
import useNews from '../../hooks/useNews';
import useSearch from '../../hooks/useSearch';
import { capitalizeFirstLetter } from '../../utils/formatters';
import styles from './Home.module.css';

/**
 * Home page component
 */
const Home = () => {
  const { 
    loading, 
    error, 
    activeCategory, 
    translateToPolish, 
    setTranslateToPolish,
    clearSearch 
  } = useNews();
  
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    handleSearch,
    handleClearSearch
  } = useSearch();
  
  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Global News Aggregator</h1>
          
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button 
                type="submit" 
                className={styles.searchButton}
                disabled={isSearching}
              >
                Search
              </button>
              {searchQuery && (
                <button 
                  type="button"
                  onClick={handleClearSearch} 
                  className={styles.clearButton}
                >
                  Clear
                </button>
              )}
            </form>
          </div>
          
          <div className={styles.settingsContainer}>
            <label className={styles.settingLabel}>
              <input
                type="checkbox"
                checked={translateToPolish}
                onChange={() => setTranslateToPolish(!translateToPolish)}
                className={styles.settingCheckbox}
              />
              Translate to Polish
            </label>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebar}>
            <SourceSearch />
            <SourceSelector />
          </aside>

          <section className={styles.newsContainer}>
            <h2 className={styles.sectionTitle}>
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : activeCategory
                  ? `${capitalizeFirstLetter(activeCategory)} News`
                  : 'Latest News'}
            </h2>
            
            <NewsList />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;