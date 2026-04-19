/**
 * ScreenJSON-UI Embedding API
 * Main entry point for CDN distribution
 */

import { mount, unmount } from 'svelte';
import ScreenJSONViewer from './components/Viewer.svelte';
import ViewerVirtual from './components/ViewerVirtual.svelte';
import ErrorDisplay from './components/ErrorDisplay.svelte';
import { DocumentLoader } from './services/loader';
import { hasEncryptedContent, decryptDocument } from './services/crypto';
import type { ScreenJSONDocument, Lang } from './types/screenjson';
import type { LoaderError } from './services/errors';
import type { Theme } from './stores/theme.svelte';

/** Configuration options for ScreenJSON-UI */
export interface ScreenJSONUIConfig {
  /** Element ID or HTMLElement to mount the viewer */
  element: string | HTMLElement;
  
  /** URL to load the ScreenJSON document from */
  src?: string;
  
  /** Pre-loaded ScreenJSON document */
  document?: ScreenJSONDocument;
  
  /** Initial theme ('light' or 'dark') */
  theme?: Theme;
  
  /** Initial zoom level (0.5 to 2) */
  zoom?: number;
  
  /** Initial language for multi-language documents */
  lang?: Lang;
  
  /** Initial page number */
  page?: number;
  
  /** Show scene numbers in margins */
  numbered?: boolean;
  
  /** Show page numbers */
  paginated?: boolean;
  
  /** Menu position */
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  /** Use virtual scrolling for large documents */
  virtual?: boolean;
  
  /** Password for encrypted documents */
  password?: string;
  
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  
  /** Callback when document is loaded */
  onLoad?: (document: ScreenJSONDocument) => void;
  
  /** Callback on error */
  onError?: (error: LoaderError) => void;
}

/** ScreenJSON-UI Instance */
export class ScreenJSONUI {
  private container: HTMLElement;
  private component: any = null;
  private config: ScreenJSONUIConfig;
  private loader: DocumentLoader;
  private document: ScreenJSONDocument | null = null;
  
  constructor(config: ScreenJSONUIConfig) {
    this.config = config;
    this.loader = new DocumentLoader();
    
    // Resolve container element
    if (typeof config.element === 'string') {
      const el = document.getElementById(config.element);
      if (!el) {
        throw new Error(`Element not found: ${config.element}`);
      }
      this.container = el;
    } else {
      this.container = config.element;
    }
    
    // Initialize
    this.init();
  }
  
  /** Initialize the viewer */
  private async init() {
    // If document is provided directly, use it
    if (this.config.document) {
      this.document = this.config.document;
      this.renderViewer();
      return;
    }
    
    // Try to get source from various places
    const src = this.config.src || this.getSourceFromUrl() || this.getSourceFromDataAttrs();
    
    if (!src) {
      this.renderError({
        code: 'UNKNOWN' as any,
        title: 'No Document Source',
        message: 'No document source was provided.',
        suggestion: 'Provide a URL using the "src" option, "?src=" query parameter, or "data-src" attribute.'
      });
      return;
    }
    
    // Load document
    this.showLoading();
    const result = await this.loader.loadFromUrl(src);
    
    if (!result.success || !result.document) {
      this.renderError(result.error!);
      this.config.onError?.(result.error!);
      return;
    }
    
    this.document = result.document;
    
    // Handle encryption
    if (hasEncryptedContent(this.document)) {
      if (this.config.password) {
        const { document: decrypted, errors } = decryptDocument(
          this.document,
          this.config.password
        );
        this.document = decrypted;
        if (errors.length > 0) {
          console.warn('Decryption warnings:', errors);
        }
      } else {
        // Need to prompt for password - for CDN embed, just show error
        this.renderError({
          code: 'ENCRYPTED_CONTENT' as any,
          title: 'Encrypted Document',
          message: 'This document contains encrypted content.',
          suggestion: 'Provide the password using the "password" option.'
        });
        return;
      }
    }
    
    this.renderViewer();
    this.config.onLoad?.(this.document);
  }
  
  /** Get source URL from query parameters */
  private getSourceFromUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('src') || params.get('source') || params.get('url');
  }
  
  /** Get source from script data attributes */
  private getSourceFromDataAttrs(): string | null {
    const script = document.currentScript as HTMLScriptElement;
    if (!script) return null;
    return script.dataset.src || script.dataset.source || null;
  }
  
  /** Get theme from URL or data attributes */
  private getTheme(): Theme {
    if (this.config.theme) return this.config.theme;
    
    // Check URL
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme');
    if (urlTheme === 'dark' || urlTheme === 'light') return urlTheme;
    
    // Check data attributes
    const script = document.currentScript as HTMLScriptElement;
    const dataTheme = script?.dataset.theme;
    if (dataTheme === 'dark' || dataTheme === 'light') return dataTheme;
    
    return 'light';
  }
  
  /** Show loading state */
  private showLoading() {
    this.container.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        background-color: #d1d5db;
        font-family: 'Courier Prime', monospace;
      ">
        <div style="text-align: center;">
          <div style="
            width: 40px;
            height: 40px;
            border: 3px solid #e5e7eb;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          "></div>
          <p style="color: #6b7280; margin: 0;">Loading screenplay...</p>
        </div>
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
  }
  
  /** Render error display */
  private renderError(error: LoaderError) {
    this.unmount();
    
    this.component = mount(ErrorDisplay, {
      target: this.container,
      props: {
        error,
        theme: this.getTheme(),
        onRetry: () => this.init()
      }
    });
  }
  
  /** Render the viewer */
  private renderViewer() {
    if (!this.document) return;
    
    this.unmount();
    
    const ViewerComponent = this.config.virtual ? ViewerVirtual : ScreenJSONViewer;
    
    this.component = mount(ViewerComponent, {
      target: this.container,
      props: {
        document: this.document,
        theme: this.getTheme(),
        initialPage: this.config.page ?? 1,
        initialZoom: this.config.zoom ?? 1,
        initialLang: this.config.lang,
        numbered: this.config.numbered ?? false,
        paginated: this.config.paginated ?? true,
        corner: this.config.corner ?? 'top-right',
        onPageChange: this.config.onPageChange
      }
    });
  }
  
  /** Unmount the current component */
  private unmount() {
    if (this.component) {
      unmount(this.component);
      this.component = null;
    }
    this.container.innerHTML = '';
  }
  
  /** Get the loaded document */
  getDocument(): ScreenJSONDocument | null {
    return this.document;
  }
  
  /** Reload the document */
  async reload() {
    this.loader.clearCache();
    await this.init();
  }
  
  /** Destroy the viewer */
  destroy() {
    this.unmount();
  }
}

/** Auto-initialize from data attributes */
function autoInit() {
  // Find script tag with data-src
  const scripts = document.querySelectorAll('script[data-src][src*="screenjson"]');
  
  scripts.forEach((script) => {
    const scriptEl = script as HTMLScriptElement;
    const src = scriptEl.dataset.src;
    
    if (!src) return;
    
    // Create container
    const container = document.createElement('div');
    container.id = `screenjson-viewer-${Date.now()}`;
    
    // Apply dimensions from data attributes
    if (scriptEl.dataset.width) {
      container.style.width = scriptEl.dataset.width.includes('%') 
        ? scriptEl.dataset.width 
        : `${scriptEl.dataset.width}px`;
    }
    if (scriptEl.dataset.height) {
      container.style.height = scriptEl.dataset.height.includes('%')
        ? scriptEl.dataset.height
        : `${scriptEl.dataset.height}px`;
    }
    
    // Insert container after script
    scriptEl.parentNode?.insertBefore(container, scriptEl.nextSibling);
    
    // Initialize viewer
    new ScreenJSONUI({
      element: container,
      src,
      theme: (scriptEl.dataset.theme as Theme) || 'light',
      zoom: scriptEl.dataset.zoom ? parseFloat(scriptEl.dataset.zoom) : 1,
      lang: scriptEl.dataset.lang,
      virtual: scriptEl.dataset.virtual === 'true'
    });
  });
}

// Auto-init on DOMContentLoaded
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}

// Export for UMD
export default ScreenJSONUI;
