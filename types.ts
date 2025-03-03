/**
 * Central type definitions for the Lume blog.
 * This file contains all interfaces and types used throughout the project.
 */

// ===== DATA TYPES =====

/**
 * Interface for blog post data
 * Used when handling post pages and listing them
 */
export interface PostData {
    /** The title of the post */
    title: string;
    /** Publication date (can be passed as string or Date object) */
    date: Date | string;
    /** The URL path to the post */
    url: string;
    /** The post content as HTML string */
    content: string;
    /** Tags associated with the post */
    tags?: string[];
    /** The layout to use for the post (usually "layouts/BlogLayout.ts") */
    layout?: string;
    /** The stylesheet path for the post */
    stylesheet?: string;
  }
  
  /**
   * Interface for metadata used in <head> tags
   */
  export interface MetaData {
    /** Page title (can be function that transforms data into a title) */
    title: string | ((data: Record<string, unknown>) => string);
    /** Page description */
    description?: string;
    /** OpenGraph image URL */
    ogImage?: string;
    /** Additional custom metadata */
    [key: string]: unknown;
  }
  
  // ===== COMPONENT PROPS =====
  
  /**
   * Props for the Time component
   */
  export interface TimeProps {
    /** Date/time to display (as string or Date object) */
    datetime: string | Date;
  }
  
  /**
   * Props for the GlobalHeader component
   */
  export interface GlobalHeaderProps {
    /** Optional active page for navigation highlighting */
    activePage?: string;
  }
  
  /**
   * Props for the GlobalFooter component
   */
  export interface GlobalFooterProps {
    /** Optional social links to display */
    socialLinks?: {
      platform: string;
      url: string;
      icon: string;
    }[];
  }
  
  // ===== LAYOUT DATA =====
  
  /**
   * Type definition for component functions
   */
  export type ComponentFunction = (...args: unknown[]) => string;
  
  /**
   * Interface for the GlobalLayout data
   */
  export interface GlobalLayoutData {
    /** Path to the stylesheet for this page */
    stylesheet: string;
    /** Page title */
    title: string;
    /** Page URL */
    url?: string;
    /** Page content as HTML string */
    content: string;
    /** Components accessible in the layout */
    comp: {
      GlobalHeader: () => string;
      GlobalFooter: () => string;
      [key: string]: ComponentFunction;
    };
    /** Metadata for the page */
    metas?: MetaData;
  }
  
  /**
   * Interface for the BlogLayout data
   * Extends GlobalLayoutData with blog-specific fields
   */
  export interface BlogLayoutData extends GlobalLayoutData {
    /** Publication date of the blog post */
    date: Date;
    /** Tags associated with the post */
    tags?: string[];
  }
  
  // ===== LUME HELPERS AND UTILITIES =====
  
  /**
   * Interface for Lume's search functionality
   */
  export interface SearchHelpers {
    /** Search for pages with optional tag filtering */
    pages: <T = Record<string, unknown>>(tag?: string) => T[];
  }
  
  /**
   * Standardized date format options used throughout the site
   */
  export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  /**
   * Interface for search results
   */
  export interface SearchResult<T = Record<string, unknown>> {
    /** Array of page objects matching the search */
    pages: T[];
    /** Base URL for search results */
    url: string;
  }
  
  /**
   * Configuration options for code highlighting
   */
  export interface CodeHighlightConfig {
    /** Theme name to use */
    name: string;
    /** Path to the CSS file */
    cssFile: string;
    /** Language extensions to handle */
    extensions?: string[];
    /** Additional languages to support */
    languages?: Record<string, unknown>;
  }
  
  /**
   * Pagination configuration
   */
  export interface PaginationConfig {
    /** Number of items per page */
    size: number;
    /** URL pattern for paginated pages */
    url?: string | ((page: number) => string);
  }
  
  // ===== LUME DATA AND HELPERS =====
  
  /**
   * Page data provided by Lume to templates
   */
  export interface LumeData {
    /** Page title */
    title?: string;
    /** Page date */
    date?: Date | string;
    /** Page content */
    content?: string;
    /** Page URL */
    url?: string;
    /** Search helper */
    search?: SearchHelpers;
    /** Available components */
    comp?: Record<string, ComponentFunction>;
    /** Metadata */
    metas?: MetaData;
    /** Path to stylesheet */
    stylesheet?: string;
    /** Additional custom properties */
    [key: string]: unknown;
  }
  
  /**
   * Helpers provided by Lume to templates
   */
  export interface LumeHelpers {
    /** Search functionality */
    search: SearchHelpers;
    /** Additional helpers */
    [key: string]: unknown;
  }
  
  /**
   * Type guard to check if a value is a Date
   */
  export function isDate(value: unknown): value is Date {
    return value instanceof Date;
  }
  
  /**
   * Safely formats a date from either string or Date object
   */
  export function formatDate(input: string | Date | undefined): string {
    if (!input) {
      return '';
    }
    
    const date = isDate(input) ? input : new Date(input);
    return date.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
  }