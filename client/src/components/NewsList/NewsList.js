// client/src/components/NewsList/NewsList.js
import React from 'react';
import NewsItem from '../NewsItem/NewsItem';
import NewsCluster from '../NewsCluster/NewsCluster';
import useNews from '../../hooks/useNews';
import { isPolishText } from '../../utils/helpers';
import styles from './NewsList.module.css';

/**
 * Component for displaying a list of news items, with optional clustering
 */
const NewsList = () => {
  const { 
    news, 
    loading, 
    error, 
    clusteringEnabled,
    setClusteringEnabled,
    autoRefreshEnabled,
    toggleAutoRefresh,
    newContentAvailable,
    clearNewContentIndicators,
    lastChecked
  } = useNews();
  
  // Determine if most content is Polish
  const isPolishContent = news?.items?.length > 0 && news.items.some(
    item => isPolishText(item.title) || item.detectedLanguage === 'pl'
  );
  
  // Format the last checked time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Toggle clustering function
  const toggleClustering = () => {
    setClusteringEnabled(!clusteringEnabled);
  };
  
  // If loading, show loading state
  if (loading) {
    return <div className={styles.loading}>
      {isPolishContent ? 'Ładowanie wiadomości...' : 'Loading news...'}
    </div>;
  }
  
  // If error, show error state
  if (error) {
    return <div className={styles.error}>
      <p>{error}</p>
    </div>;
  }
  
  // If no news, show empty state
  if (!news?.items || news.items.length === 0) {
    return <div className={styles.noNews}>
      {isPolishContent 
        ? 'Brak artykułów do wyświetlenia.' 
        : 'No articles to display.'}
    </div>;
  }
  
  // Determine which view to show based on clustering setting
  const showClustering = clusteringEnabled && 
    news.clusters && 
    Array.isArray(news.clusters) && 
    news.clusters.length > 0;
  
  // Only show toggle if clustering is available
  const showToggle = news.clusters && news.clusters.length > 0;
  
  return (
    <div>
      <div className={styles.newsHeader}>        
        {/* Controls row with both toggles */}
        <div className={styles.controlsContainer}>
          <div className={styles.togglesContainer}>
            {/* Auto-refresh toggle */}
            <label className={styles.toggleLabel}>
              <div className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={autoRefreshEnabled}
                  onChange={toggleAutoRefresh}
                />
                <span className={styles.toggleSlider}></span>
              </div>
              {isPolishContent ? 'Automatyczne odświeżanie' : 'Auto-refresh'}
            </label>
            
            {/* Clustering toggle - only show if available */}
            {showToggle && (
              <label className={styles.toggleLabel}>
                <div className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={clusteringEnabled}
                    onChange={toggleClustering}
                  />
                  <span className={styles.toggleSlider}></span>
                </div>
                {isPolishContent ? 'Grupuj podobne artykuły' : 'Group similar stories'}
              </label>
            )}
          </div>
          
          {/* Last checked timestamp on the right */}
          <div className={styles.lastCheckedInfo}>
            {isPolishContent ? 'Ostatnie sprawdzenie:' : 'Last checked:'} {formatTime(lastChecked)}
          </div>
        </div>
      </div>
      
      {/* New content notification */}
      {newContentAvailable && (
        <div 
          className={styles.newContentBanner}
          onClick={clearNewContentIndicators}
        >
          <span>
            {isPolishContent 
              ? 'Nowe artykuły są dostępne! Kliknij, aby wyczyścić oznaczenia.' 
              : 'New articles available! Click to clear indicators.'}
          </span>
        </div>
      )}
      
      {/* Render clustered or regular view based on toggle state */}
      {showClustering ? (
        <div className={styles.clusteredList}>
          {news.clusters.map((cluster, index) => (
            <NewsCluster key={`cluster-${index}`} cluster={cluster} />
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {news.items.map(item => (
            <NewsItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsList;