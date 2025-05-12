/**
 * News categories mapping for UI display
 */
export const CATEGORIES = {
    general: 'General',
    business: 'Business',
    entertainment: 'Entertainment',
    health: 'Health',
    science: 'Science',
    sports: 'Sports',
    technology: 'Technology',
    politics: 'Politics',
    culture: 'Culture',
    world: 'World News',
    environment: 'Environment',
    education: 'Education'
  };
  
  /**
   * Available countries for filtering news
   */
  export const COUNTRIES = {
    ALL: 'all',
    POLAND: 'pl',
    USA: 'us',
  };
  
  /**
   * Source category display names
   */
  export const SOURCE_CATEGORIES = {
    polish: 'Polish',
    major_rss: 'Major RSS',
    major_api: 'Major APIs',
    international: 'International',
    business: 'Business'
  };
  
  /**
   * Default settings for the application
   */
  export const DEFAULT_SETTINGS = {
    translateToPolish: false,
    clusteringEnabled: false,
    itemsPerPage: 10,
    autoRefreshEnabled: true
  };
  
  /**
   * Local storage keys
   */
  export const STORAGE_KEYS = {
    SELECTED_SOURCES: 'newsAggregator.selectedSources',
    TRANSLATE_SETTING: 'newsAggregator.translateToPolish',
    CLUSTERING_SETTING: 'newsAggregator.clusteringEnabled',
    AUTO_REFRESH_SETTING: 'newsAggregator.autoRefreshEnabled'
  };
  
  export default {
    CATEGORIES,
    COUNTRIES,
    SOURCE_CATEGORIES,
    DEFAULT_SETTINGS,
    STORAGE_KEYS
  };