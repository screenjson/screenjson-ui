<script lang="ts">
  import type { Page as PageType } from '../services/paginator';
  import { ElementRenderer } from './elements';
  import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX, MARGINS } from '../constants/formatting';
  
  interface Props {
    page: PageType;
    numbered?: boolean;
    paginated?: boolean;
    theme?: 'light' | 'dark';
    scale?: number;
    class?: string;
  }
  
  let { 
    page,
    numbered = false,
    paginated = true,
    theme = 'light',
    scale = 1,
    class: className = ''
  }: Props = $props();
  
  const isDark = $derived(theme === 'dark');
</script>

<div 
  class="screenplay-page {isDark ? 'dark' : ''} {className}"
  style="
    width: {PAGE_WIDTH_PX}px;
    height: {PAGE_HEIGHT_PX}px;
    transform: scale({scale});
    transform-origin: top center;
  "
>
  <!-- Page Header -->
  <div 
    class="page-header"
    style="
      padding-top: {MARGINS.page.top}in;
      padding-left: {MARGINS.page.left}in;
      padding-right: {MARGINS.page.right}in;
    "
  >
    {#if page.hasContinuedHeader}
      <div class="continued-header">CONTINUED:</div>
    {/if}
    
    {#if paginated && page.number > 1}
      <div class="page-number">{page.number}.</div>
    {/if}
  </div>
  
  <!-- Page Content -->
  <div 
    class="page-content"
    style="
      padding-left: 0;
      padding-right: 0;
    "
  >
    {#each page.elements as element (element.element.id)}
      <ElementRenderer {element} {numbered} />
    {/each}
  </div>
  
  <!-- Page Footer -->
  <div 
    class="page-footer"
    style="
      padding-bottom: {MARGINS.page.bottom}in;
      padding-left: {MARGINS.page.left}in;
      padding-right: {MARGINS.page.right}in;
    "
  >
    {#if page.hasContinuedFooter}
      <div class="continued-footer">(CONTINUED)</div>
    {/if}
  </div>
</div>

<style>
  .screenplay-page {
    background-color: var(--color-paper, #ffffff);
    color: var(--color-text, #000000);
    font-family: var(--font-screenplay);
    font-size: 12pt;
    line-height: 1;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    display: flex;
    flex-direction: column;
  }
  
  .screenplay-page.dark {
    background-color: var(--color-paper-dark, #1e1e1e);
    color: var(--color-text-dark, #e5e7eb);
  }
  
  .page-header {
    flex-shrink: 0;
    min-height: 0.75in;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .continued-header {
    text-transform: uppercase;
    font-weight: bold;
  }
  
  .page-number {
    margin-left: auto;
    text-align: right;
  }
  
  .page-content {
    flex: 1;
    overflow: hidden;
  }
  
  .page-footer {
    flex-shrink: 0;
    min-height: 0.75in;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }
  
  .continued-footer {
    text-transform: uppercase;
  }
  
  /* Print styles */
  @media print {
    .screenplay-page {
      page-break-after: always;
      box-shadow: none;
      margin: 0;
      padding: 0;
    }
  }
</style>
