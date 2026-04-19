<script lang="ts">
  import { onMount } from 'svelte';
  import type { ScreenJSONDocument, Lang } from '../types/screenjson';
  import { getText, getAvailableLanguages } from '../types/screenjson';
  import { paginate, type PaginationResult } from '../services/paginator';
  import Page from './Page.svelte';
  import Menu from './Menu.svelte';
  
  interface Props {
    document: ScreenJSONDocument;
    theme?: 'light' | 'dark';
    initialPage?: number;
    initialZoom?: number;
    initialLang?: Lang;
    numbered?: boolean;
    paginated?: boolean;
    corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    onPageChange?: (page: number) => void;
    class?: string;
  }
  
  let {
    document,
    theme: initialTheme = 'light',
    initialPage = 1,
    initialZoom = 1,
    initialLang,
    numbered = false,
    paginated = true,
    corner = 'top-right',
    onPageChange,
    class: className = ''
  }: Props = $props();
  
  // State
  let theme = $state<'light' | 'dark'>(initialTheme);
  let currentPage = $state(initialPage);
  let zoom = $state(initialZoom);
  let lang = $state<Lang>(initialLang ?? document.lang ?? 'en');
  let showMetadata = $state(false);
  let containerRef: HTMLDivElement | null = $state(null);
  let containerWidth = $state(0);
  
  // Derived values
  const paginationResult = $derived<PaginationResult>(paginate(document, lang));
  const totalPages = $derived(paginationResult.totalPages);
  const currentPageData = $derived(paginationResult.pages[currentPage - 1]);
  
  // Get available languages from document title (or any text field)
  const availableLanguages = $derived.by(() => {
    const langs = new Set<Lang>();
    
    // Check title
    for (const l of getAvailableLanguages(document.title)) {
      langs.add(l);
    }
    
    // Check scenes for text content
    for (const scene of document.document.scenes.slice(0, 5)) {
      for (const element of scene.body.slice(0, 10)) {
        if ('text' in element && element.text) {
          for (const l of Object.keys(element.text)) {
            langs.add(l);
          }
        }
      }
    }
    
    return Array.from(langs);
  });
  
  // Calculate auto-zoom based on container width
  const autoZoom = $derived.by(() => {
    if (containerWidth <= 0) return 1;
    const pageWidth = 816; // PAGE_WIDTH_PX
    const padding = 48; // 24px on each side
    const availableWidth = containerWidth - padding;
    
    if (availableWidth < pageWidth) {
      return availableWidth / pageWidth;
    }
    return 1;
  });
  
  const effectiveZoom = $derived(zoom * autoZoom);
  
  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
      case 'PageUp':
        goToPreviousPage();
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'PageDown':
        goToNextPage();
        event.preventDefault();
        break;
      case 'Home':
        goToPage(1);
        event.preventDefault();
        break;
      case 'End':
        goToPage(totalPages);
        event.preventDefault();
        break;
    }
  }
  
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      onPageChange?.(page);
    }
  }
  
  function goToNextPage() {
    goToPage(currentPage + 1);
  }
  
  function goToPreviousPage() {
    goToPage(currentPage - 1);
  }
  
  function handleThemeChange(newTheme: 'light' | 'dark') {
    theme = newTheme;
    // Persist to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('screenjson-theme', newTheme);
    }
  }
  
  function handleZoomChange(newZoom: number) {
    zoom = newZoom;
  }
  
  function handleLangChange(newLang: Lang) {
    lang = newLang;
  }
  
  function handlePrint() {
    window.print();
  }
  
  function handleDownload() {
    const blob = new Blob([JSON.stringify(document, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${getText(document.title, lang) || 'screenplay'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function handleShowMetadata() {
    showMetadata = !showMetadata;
  }
  
  // Setup resize observer
  onMount(() => {
    // Load theme from localStorage
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('screenjson-theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        theme = savedTheme;
      }
    }
    
    // Setup resize observer
    if (containerRef) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          containerWidth = entry.contentRect.width;
        }
      });
      observer.observe(containerRef);
      
      return () => observer.disconnect();
    }
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<div 
  class="screenplay-viewer {theme === 'dark' ? 'dark' : ''} {className}"
  bind:this={containerRef}
  role="document"
  aria-label="Screenplay Viewer"
  tabindex="0"
>
  <!-- Background -->
  <div class="viewer-background"></div>
  
  <!-- Menu -->
  <Menu
    {document}
    {currentPage}
    {totalPages}
    {theme}
    {zoom}
    {lang}
    availableLanguages={availableLanguages}
    position={corner}
    onThemeChange={handleThemeChange}
    onZoomChange={handleZoomChange}
    onPageChange={goToPage}
    onLangChange={handleLangChange}
    onPrint={handlePrint}
    onDownload={handleDownload}
    onShowMetadata={handleShowMetadata}
  />
  
  <!-- Page Container -->
  <div class="page-container">
    {#if currentPageData}
      <Page
        page={currentPageData}
        {numbered}
        {paginated}
        {theme}
        scale={effectiveZoom}
      />
    {/if}
  </div>
  
  <!-- Page Navigation -->
  <div class="page-navigation no-print">
    <button
      class="nav-button prev"
      class:dark={theme === 'dark'}
      disabled={currentPage <= 1}
      onclick={goToPreviousPage}
      aria-label="Previous page"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    
    <div class="page-indicator" class:dark={theme === 'dark'}>
      {currentPage} / {totalPages}
    </div>
    
    <button
      class="nav-button next"
      class:dark={theme === 'dark'}
      disabled={currentPage >= totalPages}
      onclick={goToNextPage}
      aria-label="Next page"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>
</div>

<style>
  .screenplay-viewer {
    position: relative;
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    outline: none;
  }
  
  .viewer-background {
    position: fixed;
    inset: 0;
    background-color: var(--color-viewer-bg, #d1d5db);
    z-index: -1;
  }
  
  .screenplay-viewer.dark .viewer-background {
    background-color: var(--color-viewer-bg-dark, #111827);
  }
  
  .page-container {
    padding: 24px;
    padding-top: 64px;
    padding-bottom: 80px;
    display: flex;
    justify-content: center;
  }
  
  .page-navigation {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 16px;
    background-color: white;
    border-radius: 9999px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    z-index: 40;
  }
  
  .screenplay-viewer.dark .page-navigation {
    background-color: #1f2937;
  }
  
  .nav-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background-color: #f3f4f6;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .nav-button:hover:not(:disabled) {
    background-color: #e5e7eb;
  }
  
  .nav-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .nav-button.dark {
    background-color: #374151;
    color: #e5e7eb;
  }
  
  .nav-button.dark:hover:not(:disabled) {
    background-color: #4b5563;
  }
  
  .page-indicator {
    font-family: var(--font-screenplay);
    font-size: 14px;
    color: #374151;
    min-width: 80px;
    text-align: center;
  }
  
  .page-indicator.dark {
    color: #e5e7eb;
  }
  
  /* Print styles */
  @media print {
    .screenplay-viewer {
      min-height: auto;
      background: none;
    }
    
    .viewer-background {
      display: none;
    }
    
    .page-container {
      padding: 0;
    }
    
    .no-print {
      display: none !important;
    }
  }
</style>
