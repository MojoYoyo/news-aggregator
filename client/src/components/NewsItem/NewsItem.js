import React from 'react';
import { formatDate } from '../../utils/formatters';
import { getSentimentDisplay, isPolishText } from '../../utils/helpers';
import useNews from '../../hooks/useNews';
import styles from './NewsItem.module.css';

/**
 * Component for displaying a single news item
 */
const NewsItem = ({ item, isInCluster = false, relatedCount = 0 }) => {
  const { clearItemNewIndicator } = useNews();
  
  if (!item || !item.id) return null;
  
  const { 
    id,
    translatedTitle, 
    title, 
    source, 
    sourceId, 
    url, 
    publishedAt, 
    description,
    imageUrl,
    author,
    isNew = false
  } = item;
  
  // Determine if a translation occurred
  const isTranslated = translatedTitle && translatedTitle !== title;
  
  // Check if the content is in Polish
  const isPolish = isPolishText(title) || item.detectedLanguage === 'pl';
  
  // Get sentiment display information
  const sentimentDisplay = getSentimentDisplay(item);
  
  // Handle click on the article - clear "new" indicator
  const handleArticleClick = () => {
    if (isNew) {
      clearItemNewIndicator(id);
    }
  };
  
  return (
    <article 
      className={`${styles.newsItem} ${isPolish ? styles.polishContent : ''} ${isNew ? styles.newItem : ''}`} 
      data-source={sourceId}
      onClick={handleArticleClick}
    >
      {/* {imageUrl && (
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={title} className={styles.image} />
        </div>
      )} */}
      
      <div className={styles.content}>
        {/* Integrated cluster indicator with the title */}
        <h3 className={styles.title}>
          {isInCluster && (
            <span className={styles.clusterIndicator}>
              <svg 
                viewBox="0 0 24 24" 
                width="16" 
                height="16" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={styles.clusterIcon}
              >
                <rect x="2" y="7" width="14" height="14" rx="2" ry="2" />
                <path d="M16 3v4" />
                <path d="M8 3v4" />
                <path d="M12 3v4" />
                <path d="M20 11h-4c-1.1 0-2-.9-2-2V5" />
              </svg>
              <span className={styles.clusterLabel}>
                {isPolish 
                  ? `Grupa (${relatedCount})` 
                  : `Group (${relatedCount})`}
              </span>
            </span>
          )}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {translatedTitle || title}
            {isNew && (
              <span className={styles.newIndicator}>
                {isPolish ? ' (nowy)' : ' (new)'}
              </span>
            )}
          </a>
        </h3>
        
        {isTranslated && (
          <div className={styles.originalTitle}>
            <small>{isPolish ? 'Oryginalny tytuł' : 'Original title'}: {title}</small>
          </div>
        )}
        
        {description && (
          <p className={styles.description}>{description}</p>
        )}
        
        <div className={styles.meta}>
          
          <span className={styles.source}>{source}</span>
          
          <span className={styles.date}>{formatDate(publishedAt, isPolish ? 'pl-PL' : 'en-US')}</span>
          
          {author && (
            <span className={styles.author}>
              {isPolish ? 'Autor' : 'By'}: {author}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default NewsItem;