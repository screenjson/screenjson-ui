<script lang="ts">
  import type { ScreenJSONDocument, Lang } from '../types/screenjson';
  
  interface Props {
    document: ScreenJSONDocument;
    currentPage: number;
    totalPages: number;
    theme: 'light' | 'dark';
    zoom: number;
    lang: Lang;
    availableLanguages: Lang[];
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    onThemeChange?: (theme: 'light' | 'dark') => void;
    onZoomChange?: (zoom: number) => void;
    onPageChange?: (page: number) => void;
    onLangChange?: (lang: Lang) => void;
    onReload?: () => void;
    onPrint?: () => void;
    onDownload?: () => void;
    onShowMetadata?: () => void;
    class?: string;
  }
  
  let {
    document,
    currentPage,
    totalPages,
    theme,
    zoom,
    lang,
    availableLanguages,
    position = 'top-right',
    onThemeChange,
    onZoomChange,
    onPageChange,
    onLangChange,
    onReload,
    onPrint,
    onDownload,
    onShowMetadata,
    class: className = ''
  }: Props = $props();
  
  let isOpen = $state(false);
  
  const positionClasses = $derived({
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }[position]);
  
  function toggleMenu() {
    isOpen = !isOpen;
  }
  
  function handleThemeToggle() {
    onThemeChange?.(theme === 'light' ? 'dark' : 'light');
  }
  
  function handleZoomIn() {
    onZoomChange?.(Math.min(zoom + 0.1, 2));
  }
  
  function handleZoomOut() {
    onZoomChange?.(Math.max(zoom - 0.1, 0.5));
  }
  
  function handleZoomReset() {
    onZoomChange?.(1);
  }
  
  function handlePageInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const page = parseInt(input.value, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange?.(page);
    }
  }
  
  function handleLangSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    onLangChange?.(select.value);
  }
</script>

<div 
  class="menu-container fixed z-50 {positionClasses} {className}"
  class:menu-open={isOpen}
>
  <!-- Menu Toggle Button -->
  <button
    class="menu-toggle"
    class:dark={theme === 'dark'}
    onclick={toggleMenu}
    aria-label={isOpen ? 'Close menu' : 'Open menu'}
    aria-expanded={isOpen}
  >
    {#if isOpen}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    {/if}
  </button>
  
  <!-- Menu Panel -->
  {#if isOpen}
    <div 
      class="menu-panel"
      class:dark={theme === 'dark'}
    >
      <!-- Page Navigation -->
      <div class="menu-section">
        <label class="menu-label">Page</label>
        <div class="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            oninput={handlePageInput}
            class="menu-input w-16"
            class:dark={theme === 'dark'}
          />
          <span class="menu-text">of {totalPages}</span>
        </div>
      </div>
      
      <!-- Zoom Controls -->
      <div class="menu-section">
        <label class="menu-label">Zoom</label>
        <div class="flex items-center gap-2">
          <button class="menu-btn" class:dark={theme === 'dark'} onclick={handleZoomOut} aria-label="Zoom out">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="menu-btn text-xs" class:dark={theme === 'dark'} onclick={handleZoomReset}>
            {Math.round(zoom * 100)}%
          </button>
          <button class="menu-btn" class:dark={theme === 'dark'} onclick={handleZoomIn} aria-label="Zoom in">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Theme Toggle -->
      <div class="menu-section">
        <label class="menu-label">Theme</label>
        <button 
          class="menu-btn-full"
          class:dark={theme === 'dark'}
          onclick={handleThemeToggle}
        >
          {#if theme === 'dark'}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 mr-2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            Light Mode
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 mr-2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            Dark Mode
          {/if}
        </button>
      </div>
      
      <!-- Language Selector -->
      {#if availableLanguages.length > 1}
        <div class="menu-section">
          <label class="menu-label">Language</label>
          <select 
            class="menu-select"
            class:dark={theme === 'dark'}
            value={lang}
            onchange={handleLangSelect}
          >
            {#each availableLanguages as langOption}
              <option value={langOption}>{langOption.toUpperCase()}</option>
            {/each}
          </select>
        </div>
      {/if}
      
      <!-- Actions -->
      <div class="menu-section menu-actions">
        {#if onReload}
          <button class="menu-btn-full" class:dark={theme === 'dark'} onclick={onReload}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 mr-2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Reload
          </button>
        {/if}
        
        {#if onPrint}
          <button class="menu-btn-full" class:dark={theme === 'dark'} onclick={onPrint}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 mr-2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print
          </button>
        {/if}
        
        {#if onDownload}
          <button class="menu-btn-full" class:dark={theme === 'dark'} onclick={onDownload}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 mr-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </button>
        {/if}
        
        {#if onShowMetadata}
          <button class="menu-btn-full" class:dark={theme === 'dark'} onclick={onShowMetadata}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Metadata
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .menu-container {
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  .menu-toggle {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: white;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  }
  
  .menu-toggle:hover {
    background-color: #f9fafb;
  }
  
  .menu-toggle.dark {
    background-color: #374151;
    border-color: #4b5563;
    color: white;
  }
  
  .menu-toggle.dark:hover {
    background-color: #4b5563;
  }
  
  .menu-panel {
    position: absolute;
    top: 48px;
    right: 0;
    width: 220px;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }
  
  .menu-panel.dark {
    background-color: #1f2937;
    border-color: #374151;
    color: white;
  }
  
  .menu-section {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .menu-section:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .menu-panel.dark .menu-section {
    border-color: #374151;
  }
  
  .menu-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 6px;
  }
  
  .menu-panel.dark .menu-label {
    color: #9ca3af;
  }
  
  .menu-text {
    font-size: 13px;
    color: #6b7280;
  }
  
  .menu-panel.dark .menu-text {
    color: #9ca3af;
  }
  
  .menu-input {
    padding: 4px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 13px;
    text-align: center;
  }
  
  .menu-input.dark {
    background-color: #374151;
    border-color: #4b5563;
    color: white;
  }
  
  .menu-select {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
  }
  
  .menu-select.dark {
    background-color: #374151;
    border-color: #4b5563;
    color: white;
  }
  
  .menu-btn {
    padding: 6px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .menu-btn:hover {
    background-color: #f3f4f6;
  }
  
  .menu-btn.dark {
    background-color: #374151;
    border-color: #4b5563;
    color: white;
  }
  
  .menu-btn.dark:hover {
    background-color: #4b5563;
  }
  
  .menu-btn-full {
    width: 100%;
    padding: 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    transition: background-color 0.2s;
  }
  
  .menu-btn-full:hover {
    background-color: #f3f4f6;
  }
  
  .menu-btn-full.dark {
    background-color: #374151;
    border-color: #4b5563;
    color: white;
  }
  
  .menu-btn-full.dark:hover {
    background-color: #4b5563;
  }
  
  .menu-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
</style>
