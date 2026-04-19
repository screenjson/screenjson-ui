/**
 * Document Loader Service
 * Handles loading ScreenJSON documents from various sources
 */

import type { ScreenJSONDocument } from '../types/screenjson';
import { validateDocument } from '../validation/validator';
import {
  type LoaderError,
  httpStatusToError,
  createNetworkError,
  createJSONError,
  createValidationError,
  createEmptyDocumentError,
  createMissingScenesError,
  createUnknownError
} from './errors';

/** Load result type */
export interface LoadResult {
  success: boolean;
  document: ScreenJSONDocument | null;
  error: LoaderError | null;
  source: string;
}

/** Loader options */
export interface LoaderOptions {
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Whether to validate against schema (default: true) */
  validate?: boolean;
  /** Custom fetch headers */
  headers?: Record<string, string>;
  /** AbortController signal for cancellation */
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT = 30000;

/**
 * Fetch document from a URL
 */
async function fetchFromUrl(
  url: string,
  options: LoaderOptions = {}
): Promise<LoadResult> {
  const { timeout = DEFAULT_TIMEOUT, headers = {}, signal } = options;
  
  // Create abort controller for timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);
  
  // Combine signals if external signal provided
  const combinedSignal = signal
    ? new AbortController().signal
    : timeoutController.signal;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...headers
      },
      signal: combinedSignal
    });
    
    clearTimeout(timeoutId);
    
    // Check HTTP status
    if (!response.ok) {
      return {
        success: false,
        document: null,
        error: httpStatusToError(response.status, response.statusText, url),
        source: url
      };
    }
    
    // Check for empty response
    const text = await response.text();
    if (!text || text.trim() === '') {
      return {
        success: false,
        document: null,
        error: createEmptyDocumentError(url),
        source: url
      };
    }
    
    // Parse JSON
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return {
        success: false,
        document: null,
        error: createJSONError(e as Error, url),
        source: url
      };
    }
    
    // Validate document
    if (options.validate !== false) {
      const validation = validateDocument(data);
      if (!validation.valid) {
        const errorMessages = validation.errors.map(
          (e) => `${e.path}: ${e.message}`
        );
        return {
          success: false,
          document: null,
          error: createValidationError(errorMessages, url),
          source: url
        };
      }
      
      // Additional checks
      const doc = validation.document!;
      if (!doc.document?.scenes || doc.document.scenes.length === 0) {
        return {
          success: false,
          document: null,
          error: createMissingScenesError(url),
          source: url
        };
      }
      
      return {
        success: true,
        document: doc,
        error: null,
        source: url
      };
    }
    
    // Return without validation
    return {
      success: true,
      document: data as ScreenJSONDocument,
      error: null,
      source: url
    };
    
  } catch (e) {
    clearTimeout(timeoutId);
    const error = e as Error;
    
    return {
      success: false,
      document: null,
      error: createNetworkError(error, url),
      source: url
    };
  }
}

/**
 * Load document from a File object (for file input)
 */
async function loadFromFile(
  file: File,
  options: LoaderOptions = {}
): Promise<LoadResult> {
  const source = `file://${file.name}`;
  
  try {
    const text = await file.text();
    
    if (!text || text.trim() === '') {
      return {
        success: false,
        document: null,
        error: createEmptyDocumentError(source),
        source
      };
    }
    
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return {
        success: false,
        document: null,
        error: createJSONError(e as Error, source),
        source
      };
    }
    
    if (options.validate !== false) {
      const validation = validateDocument(data);
      if (!validation.valid) {
        const errorMessages = validation.errors.map(
          (e) => `${e.path}: ${e.message}`
        );
        return {
          success: false,
          document: null,
          error: createValidationError(errorMessages, source),
          source
        };
      }
      
      return {
        success: true,
        document: validation.document,
        error: null,
        source
      };
    }
    
    return {
      success: true,
      document: data as ScreenJSONDocument,
      error: null,
      source
    };
    
  } catch (e) {
    return {
      success: false,
      document: null,
      error: createUnknownError(e as Error),
      source
    };
  }
}

/**
 * Load document from a JSON string
 */
function loadFromString(
  jsonString: string,
  options: LoaderOptions = {}
): LoadResult {
  const source = 'string';
  
  if (!jsonString || jsonString.trim() === '') {
    return {
      success: false,
      document: null,
      error: createEmptyDocumentError(source),
      source
    };
  }
  
  let data: unknown;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    return {
      success: false,
      document: null,
      error: createJSONError(e as Error, source),
      source
    };
  }
  
  if (options.validate !== false) {
    const validation = validateDocument(data);
    if (!validation.valid) {
      const errorMessages = validation.errors.map(
        (e) => `${e.path}: ${e.message}`
      );
      return {
        success: false,
        document: null,
        error: createValidationError(errorMessages, source),
        source
      };
    }
    
    return {
      success: true,
      document: validation.document,
      error: null,
      source
    };
  }
  
  return {
    success: true,
    document: data as ScreenJSONDocument,
    error: null,
    source
  };
}

/**
 * Load document from a pre-parsed object
 */
function loadFromObject(
  data: unknown,
  options: LoaderOptions = {}
): LoadResult {
  const source = 'object';
  
  if (!data) {
    return {
      success: false,
      document: null,
      error: createEmptyDocumentError(source),
      source
    };
  }
  
  if (options.validate !== false) {
    const validation = validateDocument(data);
    if (!validation.valid) {
      const errorMessages = validation.errors.map(
        (e) => `${e.path}: ${e.message}`
      );
      return {
        success: false,
        document: null,
        error: createValidationError(errorMessages, source),
        source
      };
    }
    
    return {
      success: true,
      document: validation.document,
      error: null,
      source
    };
  }
  
  return {
    success: true,
    document: data as ScreenJSONDocument,
    error: null,
    source
  };
}

/**
 * Get source URL from query parameters
 */
export function getSourceFromQueryParams(): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  return params.get('src') || params.get('source') || params.get('url');
}

/**
 * Get source URL from script data attributes
 */
export function getSourceFromDataAttributes(
  scriptElement?: HTMLScriptElement | null
): string | null {
  if (typeof document === 'undefined') return null;
  
  const script = scriptElement || document.currentScript as HTMLScriptElement;
  if (!script) return null;
  
  return script.dataset.src || script.dataset.source || script.dataset.url || null;
}

/**
 * Detect the best source to load from based on available options
 */
export function detectSource(config?: {
  src?: string;
  element?: string | HTMLElement;
}): string | null {
  // 1. Check explicit config
  if (config?.src) return config.src;
  
  // 2. Check query params
  const querySource = getSourceFromQueryParams();
  if (querySource) return querySource;
  
  // 3. Check data attributes
  const dataSource = getSourceFromDataAttributes();
  if (dataSource) return dataSource;
  
  return null;
}

/**
 * Main loader class
 */
export class DocumentLoader {
  private options: LoaderOptions;
  private cache: Map<string, ScreenJSONDocument> = new Map();
  
  constructor(options: LoaderOptions = {}) {
    this.options = options;
  }
  
  /**
   * Load a document from a URL
   */
  async loadFromUrl(url: string): Promise<LoadResult> {
    // Check cache first
    if (this.cache.has(url)) {
      return {
        success: true,
        document: this.cache.get(url)!,
        error: null,
        source: url
      };
    }
    
    const result = await fetchFromUrl(url, this.options);
    
    // Cache successful loads
    if (result.success && result.document) {
      this.cache.set(url, result.document);
    }
    
    return result;
  }
  
  /**
   * Load a document from a File
   */
  async loadFromFile(file: File): Promise<LoadResult> {
    return loadFromFile(file, this.options);
  }
  
  /**
   * Load a document from a JSON string
   */
  loadFromString(jsonString: string): LoadResult {
    return loadFromString(jsonString, this.options);
  }
  
  /**
   * Load a document from a pre-parsed object
   */
  loadFromObject(data: unknown): LoadResult {
    return loadFromObject(data, this.options);
  }
  
  /**
   * Auto-detect source and load
   */
  async autoLoad(config?: { src?: string }): Promise<LoadResult> {
    const source = detectSource(config);
    
    if (!source) {
      return {
        success: false,
        document: null,
        error: {
          code: 'UNKNOWN' as any,
          title: 'No Source Specified',
          message: 'No document source was provided.',
          suggestion: 'Provide a URL via the "src" option, query parameter, or data attribute.'
        },
        source: ''
      };
    }
    
    return this.loadFromUrl(source);
  }
  
  /**
   * Clear the document cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Remove a specific URL from cache
   */
  invalidateCache(url: string): void {
    this.cache.delete(url);
  }
}

// Export singleton instance
export const loader = new DocumentLoader();

// Export convenience functions
export const loadFromUrl = (url: string, options?: LoaderOptions) =>
  fetchFromUrl(url, options);

export { loadFromFile, loadFromString, loadFromObject };
