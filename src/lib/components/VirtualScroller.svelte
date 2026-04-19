<script lang="ts">
  import { onMount } from 'svelte';
  import type { Page as PageType } from '../services/paginator';
  import Page from './Page.svelte';
  import { PAGE_HEIGHT_PX } from '../constants/formatting';
  
  interface Props {
    pages: PageType[];
    numbered?: boolean;
    paginated?: boolean;
    theme?: 'light' | 'dark';
    scale?: number;
    bufferPages?: number;
    onVisiblePageChange?: (pageNumber: number) => void;
    class?: string;
  }
  
  let {
    pages,
    numbered = false,
    paginated = true,
    theme = 'light',
    scale = 1,
    bufferPages = 2,
    onVisiblePageChange,
    class: className = ''
  }: Props = $props();
  
  let containerRef: HTMLDivElement | null = $state(null);
  let scrollTop = $state(0);
  let containerHeight = $state(0);
  
  // Calculate page dimensions with scale
  const pageHeight = $derived(PAGE_HEIGHT_PX * scale);
  const pageGap = $derived(24 * scale);
  const totalPageHeight = $derived(pageHeight + pageGap);
  
  // Calculate total content height
  const totalHeight = $derived(pages.length * totalPageHeight);
  
  // Calculate visible range with buffer
  const visibleRange = $derived.by(() => {
    const startPage = Math.max(0, Math.floor(scrollTop / totalPageHeight) - bufferPages);
    const visibleCount = Math.ceil(containerHeight / totalPageHeight) + bufferPages * 2;
    const endPage = Math.min(pages.length - 1, startPage + visibleCount);
    
    return { startPage, endPage };
  });
  
  // Get visible pages
  const visiblePages = $derived.by(() => {
    const { startPage, endPage } = visibleRange;
    return pages.slice(startPage, endPage + 1).map((page, index) => ({
      page,
      index: startPage + index,
      offsetY: (startPage + index) * totalPageHeight
    }));
  });
  
  // Calculate current visible page (the one most in view)
  const currentVisiblePage = $derived.by(() => {
    const centerScroll = scrollTop + containerHeight / 2;
    return Math.min(pages.length, Math.max(1, Math.floor(centerScroll / totalPageHeight) + 1));
  });
  
  // Handle scroll events
  function handleScroll(event: Event) {
    const target = event.target as HTMLDivElement;
    scrollTop = target.scrollTop;
    
    // Notify parent of visible page change
    onVisiblePageChange?.(currentVisiblePage);
  }
  
  // Scroll to a specific page
  export function scrollToPage(pageNumber: number) {
    if (!containerRef) return;
    
    const targetScroll = (pageNumber - 1) * totalPageHeight;
    containerRef.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }
  
  // Setup resize observer
  onMount(() => {
    if (!containerRef) return;
    
    // Initial height
    containerHeight = containerRef.clientHeight;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerHeight = entry.contentRect.height;
      }
    });
    
    observer.observe(containerRef);
    
    return () => observer.disconnect();
  });
</script>

<div 
  class="virtual-scroller {className}"
  bind:this={containerRef}
  onscroll={handleScroll}
>
  <!-- Spacer to create scrollable height -->
  <div class="scroll-spacer" style="height: {totalHeight}px;">
    <!-- Render only visible pages -->
    {#each visiblePages as { page, offsetY } (page.number)}
      <div 
        class="page-wrapper"
        style="
          transform: translateY({offsetY}px);
          height: {pageHeight}px;
        "
      >
        <Page
          {page}
          {numbered}
          {paginated}
          {theme}
          {scale}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .virtual-scroller {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .scroll-spacer {
    position: relative;
    width: 100%;
  }
  
  .page-wrapper {
    position: absolute;
    left: 50%;
    transform-origin: top center;
    display: flex;
    justify-content: center;
  }
  
  /* Adjust transform to center horizontally */
  .page-wrapper {
    transform: translateX(-50%);
  }
</style>
