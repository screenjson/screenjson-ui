/**
 * Document Store
 * Manages the currently loaded ScreenJSON document
 */

import type { ScreenJSONDocument, Lang } from '../types/screenjson';
import { getText, getAvailableLanguages } from '../types/screenjson';
import { paginate, type PaginationResult } from '../services/paginator';

/** Create a reactive document store */
function createDocumentStore() {
  let document = $state<ScreenJSONDocument | null>(null);
  let lang = $state<Lang>('en');
  let paginationCache = $state<PaginationResult | null>(null);
  
  // Invalidate pagination cache when document or lang changes
  function invalidateCache() {
    paginationCache = null;
  }
  
  return {
    get current() {
      return document;
    },
    
    get lang() {
      return lang;
    },
    
    get isLoaded() {
      return document !== null;
    },
    
    get title() {
      if (!document) return '';
      return getText(document.title, lang);
    },
    
    get availableLanguages() {
      if (!document) return [];
      return getAvailableLanguages(document.title);
    },
    
    get scenes() {
      return document?.document.scenes ?? [];
    },
    
    get characters() {
      return document?.characters ?? [];
    },
    
    get authors() {
      return document?.authors ?? [];
    },
    
    get pagination(): PaginationResult | null {
      if (!document) return null;
      
      if (!paginationCache) {
        paginationCache = paginate(document, lang);
      }
      
      return paginationCache;
    },
    
    get totalPages() {
      return this.pagination?.totalPages ?? 0;
    },
    
    setDocument(doc: ScreenJSONDocument | null) {
      document = doc;
      if (doc) {
        lang = doc.lang ?? 'en';
      }
      invalidateCache();
    },
    
    setLang(newLang: Lang) {
      if (newLang !== lang) {
        lang = newLang;
        invalidateCache();
      }
    },
    
    clear() {
      document = null;
      paginationCache = null;
    },
    
    /** Get character name by ID */
    getCharacterName(id: string): string {
      const character = document?.characters?.find((c) => c.id === id);
      return character?.name ?? 'UNKNOWN';
    },
    
    /** Get author name by ID */
    getAuthorName(id: string): string {
      const author = document?.authors?.find((a) => a.id === id);
      if (!author) return 'Unknown';
      return `${author.given} ${author.family}`;
    },
    
    /** Get page number for a scene */
    getPageForScene(sceneId: string): number | null {
      const pagination = this.pagination;
      if (!pagination) return null;
      
      for (const page of pagination.pages) {
        for (const element of page.elements) {
          if (element.sceneId === sceneId) {
            return page.number;
          }
        }
      }
      
      return null;
    }
  };
}

export const documentStore = createDocumentStore();
