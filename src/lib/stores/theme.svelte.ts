/**
 * Theme Store
 * Manages light/dark theme state with persistence
 */

import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'screenjson-theme';

/** Create a reactive theme store */
function createThemeStore() {
  // Initialize from localStorage or system preference
  let theme = $state<Theme>('light');
  
  if (browser) {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else {
      // Fall back to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
  }
  
  return {
    get current() {
      return theme;
    },
    
    get isDark() {
      return theme === 'dark';
    },
    
    get isLight() {
      return theme === 'light';
    },
    
    set(newTheme: Theme) {
      theme = newTheme;
      if (browser) {
        localStorage.setItem(STORAGE_KEY, newTheme);
        // Update document class for global styling
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
    },
    
    toggle() {
      this.set(theme === 'light' ? 'dark' : 'light');
    },
    
    /** Initialize theme on page load (call in onMount) */
    init() {
      if (browser) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        
        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
          // Only auto-switch if user hasn't set a preference
          if (!localStorage.getItem(STORAGE_KEY)) {
            this.set(e.matches ? 'dark' : 'light');
          }
        };
        mediaQuery.addEventListener('change', handleChange);
        
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  };
}

export const themeStore = createThemeStore();

/** CSS custom properties for themes */
export const themeVars = {
  light: {
    '--viewer-bg': '#d1d5db',
    '--paper-bg': '#ffffff',
    '--text-color': '#000000',
    '--text-secondary': '#6b7280',
    '--border-color': '#e5e7eb',
    '--shadow-color': 'rgb(0 0 0 / 0.1)'
  },
  dark: {
    '--viewer-bg': '#111827',
    '--paper-bg': '#1e1e1e',
    '--text-color': '#e5e7eb',
    '--text-secondary': '#9ca3af',
    '--border-color': '#374151',
    '--shadow-color': 'rgb(0 0 0 / 0.3)'
  }
} as const;

/** Get CSS variables for current theme */
export function getThemeVars(theme: Theme): Record<string, string> {
  return themeVars[theme];
}

/** Apply theme variables to an element's style */
export function applyThemeVars(element: HTMLElement, theme: Theme) {
  const vars = themeVars[theme];
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}
