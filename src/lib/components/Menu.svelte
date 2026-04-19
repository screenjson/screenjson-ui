<script lang="ts">
  import type { ScreenJSONDocument, Lang } from '../types/screenjson';

  interface Props {
    document: ScreenJSONDocument;
    theme: 'light' | 'dark';
    zoom: number;
    lang: Lang;
    title: string;
    totalPages: number;
    availableLanguages: Lang[];
    onThemeChange?: (theme: 'light' | 'dark') => void;
    onZoomChange?: (zoom: number) => void;
    onLangChange?: (lang: Lang) => void;
    onPrint?: () => void;
    onDownload?: () => void;
    onShowMetadata?: () => void;
  }

  let {
    document,
    theme,
    zoom,
    lang,
    title,
    totalPages,
    availableLanguages,
    onThemeChange,
    onZoomChange,
    onLangChange,
    onPrint,
    onDownload,
    onShowMetadata
  }: Props = $props();

  const zoomPct = $derived(Math.round(zoom * 100));

  function zoomIn()    { onZoomChange?.(Math.min(zoom + 0.1, 2)); }
  function zoomOut()   { onZoomChange?.(Math.max(zoom - 0.1, 0.5)); }
  function zoomReset() { onZoomChange?.(1); }
  function toggleTheme() { onThemeChange?.(theme === 'light' ? 'dark' : 'light'); }
</script>

<header
  class="no-print sticky top-0 z-40 w-full border-b
         bg-[color:var(--color-ui-bg)] text-[color:var(--color-ui-fg)]
         border-[color:var(--color-ui-border)]"
>
  <div class="mx-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-12 max-w-screen-2xl">
    <!-- Brand -->
    <div class="flex items-center gap-2 mr-2 shrink-0">
      <span
        aria-hidden="true"
        class="inline-flex h-7 w-7 items-center justify-center border
               bg-[color:var(--color-brand-500)] text-white border-current
               text-[10px] font-black font-sans tracking-tight"
      >SJ</span>
      <span class="hidden sm:inline font-sans text-sm font-semibold truncate max-w-[24ch]">
        {title}
      </span>
    </div>

    <span class="hidden md:inline text-xs text-[color:var(--color-ui-muted)] font-sans">
      {totalPages} {totalPages === 1 ? 'page' : 'pages'}
    </span>

    <div class="ml-auto flex items-center gap-1 sm:gap-2">
      <!-- Zoom group -->
      <div class="hidden sm:flex items-center rounded-md border border-[color:var(--color-ui-border)]">
        <button
          type="button"
          class="h-8 w-8 flex items-center justify-center hover:bg-[color:var(--color-ui-hover)]"
          onclick={zoomOut}
          aria-label="Zoom out"
          disabled={zoom <= 0.5}
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          type="button"
          class="h-8 px-2 font-sans text-xs tabular-nums hover:bg-[color:var(--color-ui-hover)]"
          onclick={zoomReset}
          title="Reset zoom"
        >{zoomPct}%</button>
        <button
          type="button"
          class="h-8 w-8 flex items-center justify-center hover:bg-[color:var(--color-ui-hover)]"
          onclick={zoomIn}
          aria-label="Zoom in"
          disabled={zoom >= 2}
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <!-- Language -->
      {#if availableLanguages.length > 1}
        <label class="sr-only" for="sj-lang-select">Language</label>
        <select
          id="sj-lang-select"
          class="h-8 rounded-md border border-[color:var(--color-ui-border)] bg-transparent px-2 font-sans text-xs hover:bg-[color:var(--color-ui-hover)]"
          value={lang}
          onchange={(e) => onLangChange?.((e.target as HTMLSelectElement).value)}
        >
          {#each availableLanguages as l}
            <option value={l}>{l.toUpperCase()}</option>
          {/each}
        </select>
      {/if}

      <!-- Metadata -->
      {#if onShowMetadata}
        <button
          type="button"
          class="h-8 px-2 rounded-md border border-[color:var(--color-ui-border)] font-sans text-xs hover:bg-[color:var(--color-ui-hover)] hidden sm:inline-flex items-center gap-1.5"
          onclick={onShowMetadata}
          aria-label="Show metadata"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span class="hidden md:inline">Info</span>
        </button>
      {/if}

      <!-- Print -->
      {#if onPrint}
        <button
          type="button"
          class="h-8 w-8 rounded-md border border-[color:var(--color-ui-border)] flex items-center justify-center hover:bg-[color:var(--color-ui-hover)]"
          onclick={onPrint}
          aria-label="Print"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
        </button>
      {/if}

      <!-- Download -->
      {#if onDownload}
        <button
          type="button"
          class="h-8 w-8 rounded-md border border-[color:var(--color-ui-border)] flex items-center justify-center hover:bg-[color:var(--color-ui-hover)]"
          onclick={onDownload}
          aria-label="Download ScreenJSON"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      {/if}

      <!-- Theme -->
      <button
        type="button"
        class="h-8 w-8 rounded-md border border-[color:var(--color-ui-border)] flex items-center justify-center hover:bg-[color:var(--color-ui-hover)]"
        onclick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {#if theme === 'dark'}
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        {/if}
      </button>
    </div>
  </div>
</header>
