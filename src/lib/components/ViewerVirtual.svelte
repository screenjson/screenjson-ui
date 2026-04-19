<script lang="ts">
  import { onMount } from 'svelte';
  import type { ScreenJSONDocument, Lang } from '../types/screenjson';
  import { getText, getAvailableLanguages } from '../types/screenjson';
  import { paginate, type PaginationResult } from '../services/paginator';
  import VirtualScroller from './VirtualScroller.svelte';
  import Menu from './Menu.svelte';
  import MetadataPanel from './MetadataPanel.svelte';
  
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
  let virtualerRef: VirtualScroller | null = $state(null);
  
  // Derived values
  const paginationResult = $derived<PaginationResult>(paginate(document, lang));
  const totalPages = $derived(paginationResult.totalPages);
  
  // Get available languages
  const availableLanguages = $derived.by(() => {
    const langs = new Set<Lang>();
    
    for (const l of getAvailableLanguages(document.title)) {
      langs.add(l);
    }
    
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
    const pageWidth = 816;
    const padding = 48;
    const availableWidth = containerWidth - padding;
    
    if (availableWidth < pageWidth) {
      return availableWidth / pageWidth;
    }
    return 1;
  });
  
  const effectiveZoom = $derived(zoom * autoZoom);
  
  function handleVisiblePageChange(page: number) {
    currentPage = page;
    onPageChange?.(page);
  }
  
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      virtualerRef?.scrollToPage(page);
      onPageChange?.(page);
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'PageUp':
        goToPage(currentPage - 1);
        event.preventDefault();
        break;
      case 'ArrowDown':
      case 'PageDown':
        goToPage(currentPage + 1);
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
  
  function handleThemeChange(newTheme: 'light' | 'dark') {
    theme = newTheme;
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
  
  function handleNavigateToScene(sceneId: string) {
    const pagination = paginationResult;
    for (const page of pagination.pages) {
      for (const element of page.elements) {
        if (element.sceneId === sceneId) {
          goToPage(page.number);
          showMetadata = false;
          return;
        }
      }
    }
  }
  
  onMount(() => {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('screenjson-theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        theme = savedTheme;
      }
    }
    
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
  class="screenplay-viewer-virtual {theme === 'dark' ? 'dark' : ''} {className}"
  bind:this={containerRef}
  role="document"
  aria-label="Screenplay Viewer"
  tabindex="0"
>
  <div class="viewer-background"></div>
  
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
  
  <VirtualScroller
    bind:this={virtualerRef}
    pages={paginationResult.pages}
    {numbered}
    {paginated}
    {theme}
    scale={effectiveZoom}
    onVisiblePageChange={handleVisiblePageChange}
    class="scroller-content"
  />
  
  <div class="page-indicator no-print" class:dark={theme === 'dark'}>
    {currentPage} / {totalPages}
  </div>
  
  <MetadataPanel
    {document}
    {lang}
    isOpen={showMetadata}
    {theme}
    onClose={() => showMetadata = false}
    onNavigateToScene={handleNavigateToScene}
  />
</div>

<style>
  .screenplay-viewer-virtual {
    position: relative;
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    outline: none;
  }
  
  .viewer-background {
    position: fixed;
    inset: 0;
    background-color: var(--color-viewer-bg, #d1d5db);
    z-index: -1;
  }
  
  .screenplay-viewer-virtual.dark .viewer-background {
    background-color: var(--color-viewer-bg-dark, #111827);
  }
  
  .scroller-content {
    flex: 1;
    padding-top: 60px;
  }
  
  .page-indicator {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 20px;
    background-color: white;
    border-radius: 9999px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    font-family: var(--font-screenplay);
    font-size: 14px;
    color: #374151;
    z-index: 40;
  }
  
  .page-indicator.dark {
    background-color: #1f2937;
    color: #e5e7eb;
  }
  
  @media print {
    .screenplay-viewer-virtual {
      height: auto;
    }
    
    .viewer-background {
      display: none;
    }
    
    .no-print {
      display: none !important;
    }
  }
</style>
