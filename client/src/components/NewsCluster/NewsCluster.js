// client/src/components/NewsCluster/NewsCluster.js
import React from 'react';
import NewsItem from '../NewsItem/NewsItem';
import { formatDate } from '../../utils/formatters';
import { isPolishText } from '../../utils/helpers';
import useNews from '../../hooks/useNews';
import styles from './NewsCluster.module.css';

/**
 * Component for displaying a cluster of related news stories
 */
const NewsCluster = ({ cluster }) => {
  const { clearItemNewIndicator } = useNews();
  
  // Validate cluster data
  if (!Array.isArray(cluster) || cluster.length === 0) {
    return null;
  }

  // Sort to prioritize new articles, then by publish date
  const sortedCluster = [...cluster].sort((a, b) => {
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  // Use the first article as the main story (which might be new after sorting)
  const mainStory = sortedCluster[0];
  if (!mainStory || !mainStory.id) return null;
  
  // Related stories are the rest
  const relatedStories = sortedCluster.slice(1);
  const relatedCount = relatedStories.length;
  
  // Check if any article in the cluster is new
  const hasNewArticles = sortedCluster.some(article => article.isNew);
  
  // Detect if content is Polish
  const isPolish = isPolishText(mainStory.title) || mainStory.detectedLanguage === 'pl';
  
  // Handle click on a related story - clear "new" indicator
  const handleRelatedStoryClick = (id) => {
    clearItemNewIndicator(id);
  };
  
  return (
    <div className={`${styles.storyCluster} ${hasNewArticles ? styles.hasNewArticles : ''}`}>
      <div className={styles.mainStory}>
        {/* Create a version of NewsItem with extra cluster information */}
        <NewsItem 
          item={mainStory} 
          isInCluster={true}
          relatedCount={relatedCount}
        />
      </div>
      
      {relatedStories.length > 0 && (
        <div className={styles.relatedStories}>
          <h4 className={styles.relatedStoriesHeading}>
            {isPolish ? 'Powiązane artykuły' : 'Related Coverage'} ({relatedCount})
          </h4>
          <div className={styles.relatedStoriesList}>
            {relatedStories.map(story => (
              <div 
                key={story.id} 
                className={`${styles.relatedStory} ${story.isNew ? styles.newRelatedStory : ''}`}
                onClick={() => handleRelatedStoryClick(story.id)}
              >
                <h5 className={styles.relatedStoryTitle}>
                  <a href={story.url} target="_blank" rel="noopener noreferrer">
                    {story.translatedTitle || story.title}
                    {story.isNew && (
                      <span className={styles.newIndicator}>
                        {isPolish ? ' (nowy)' : ' (new)'}
                      </span>
                    )}
                  </a>
                </h5>
                <div className={styles.relatedStoryMeta}>
                  <span className={styles.relatedSource}>{story.source}</span>
                  <span className={styles.relatedTime}>
                    {formatDate(story.publishedAt, isPolish ? 'pl-PL' : 'en-US')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsCluster;