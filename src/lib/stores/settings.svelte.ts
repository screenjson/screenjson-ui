/**
 * Settings Store
 * Manages viewer settings with persistence
 */

import { browser } from '$app/environment';
import type { Lang } from '../types/screenjson';

const STORAGE_KEY = 'screenjson-settings';

export interface ViewerSettings {
  zoom: number;
  numbered: boolean;
  paginated: boolean;
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  preferredLang: Lang | null;
}

const defaultSettings: ViewerSettings = {
  zoom: 1,
  numbered: false,
  paginated: true,
  corner: 'top-right',
  preferredLang: null
};

/** Load settings from localStorage */
function loadSettings(): ViewerSettings {
  if (!browser) return { ...defaultSettings };
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  
  return { ...defaultSettings };
}

/** Save settings to localStorage */
function saveSettings(settings: ViewerSettings) {
  if (browser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}

/** Create a reactive settings store */
function createSettingsStore() {
  let settings = $state<ViewerSettings>(loadSettings());
  
  return {
    get current() {
      return settings;
    },
    
    get zoom() {
      return settings.zoom;
    },
    
    get numbered() {
      return settings.numbered;
    },
    
    get paginated() {
      return settings.paginated;
    },
    
    get corner() {
      return settings.corner;
    },
    
    get preferredLang() {
      return settings.preferredLang;
    },
    
    setZoom(zoom: number) {
      settings = { ...settings, zoom: Math.max(0.5, Math.min(2, zoom)) };
      saveSettings(settings);
    },
    
    setShowSceneNumbers(show: boolean) {
      settings = { ...settings, numbered: show };
      saveSettings(settings);
    },
    
    setShowPageNumbers(show: boolean) {
      settings = { ...settings, paginated: show };
      saveSettings(settings);
    },
    
    setMenuPosition(position: ViewerSettings['corner']) {
      settings = { ...settings, corner: position };
      saveSettings(settings);
    },
    
    setPreferredLang(lang: Lang | null) {
      settings = { ...settings, preferredLang: lang };
      saveSettings(settings);
    },
    
    update(partial: Partial<ViewerSettings>) {
      settings = { ...settings, ...partial };
      saveSettings(settings);
    },
    
    reset() {
      settings = { ...defaultSettings };
      saveSettings(settings);
    }
  };
}

export const settingsStore = createSettingsStore();
