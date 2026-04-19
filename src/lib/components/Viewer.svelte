<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { ScreenJSONDocument, Lang } from '../types/screenjson';
  import { getText, getAvailableLanguages } from '../types/screenjson';
  import { paginate, type PaginationResult } from '../services/paginator';
  import Page from './Page.svelte';
  import Menu from './Menu.svelte';
  import MetadataPanel from './MetadataPanel.svelte';

  interface Props {
    document: ScreenJSONDocument;
    theme?: 'light' | 'dark';
    /** Manual zoom multiplier on top of auto-fit. 1 = fit. */
    zoom?: number;
    lang?: Lang;
    numbered?: boolean;
    paginated?: boolean;
    showMenu?: boolean;
    class?: string;
  }

  let {
    document: doc,
    theme: themeProp,
    zoom: zoomProp,
    lang: langProp,
    numbered = false,
    paginated = true,
    showMenu = true,
    class: className = ''
  }: Props = $props();

  /* ---- local reactive state ---- */
  let theme = $state<'light' | 'dark'>('light');
  let zoom  = $state(1);
  let lang  = $state<Lang>('en');

  $effect.pre(() => {
    if (themeProp === 'light' || themeProp === 'dark') untrack(() => { theme = themeProp; });
  });
  $effect.pre(() => {
    if (typeof zoomProp === 'number') untrack(() => { zoom = zoomProp; });
  });
  $effect.pre(() => {
    if (langProp) untrack(() => { lang = langProp; });
    else if (doc?.lang) untrack(() => { lang = doc.lang; });
  });

  let showMetadata = $state(false);
  let containerRef: HTMLDivElement | null = $state(null);
  let containerWidth = $state(0);

  /* ---- pagination ---- */
  const paginationResult = $derived<PaginationResult>(paginate(doc, lang));

  const availableLanguages = $derived.by<Lang[]>(() => {
    const langs = new Set<Lang>();
    for (const l of getAvailableLanguages(doc.title)) langs.add(l);
    for (const scene of doc.document.scenes.slice(0, 10)) {
      for (const el of scene.body.slice(0, 8)) {
        if ('text' in el && el.text) {
          for (const l of Object.keys(el.text)) langs.add(l as Lang);
        }
      }
    }
    return Array.from(langs);
  });

  const title = $derived(getText(doc.title, lang) || 'Untitled');

  /* ---- auto-fit zoom: shrink paper when viewport is narrow ---- */
  const PAGE_PX = 816;          // 8.5in @ 96 DPI
  const HORIZONTAL_PAD = 64;    // px breathing room on each side combined
  const fitZoom = $derived.by(() => {
    if (containerWidth <= 0) return 1;
    const usable = containerWidth - HORIZONTAL_PAD;
    if (usable >= PAGE_PX) return 1;
    return Math.max(0.4, usable / PAGE_PX);
  });
  const effectiveZoom = $derived(Math.min(2, Math.max(0.3, fitZoom * zoom)));

  /* ---- theme on html class, persist ---- */
  $effect(() => {
    if (typeof window === 'undefined') return;
    const html = window.document.documentElement;
    if (theme === 'dark') html.classList.add('dark');
    else                  html.classList.remove('dark');
    try { window.localStorage.setItem('screenjson-theme', theme); } catch {}
  });

  onMount(() => {
    /* theme: prefer saved -> OS -> light */
    try {
      const saved = window.localStorage.getItem('screenjson-theme');
      if (saved === 'light' || saved === 'dark') {
        theme = saved;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
      }
    } catch {}

    /* container width observer for auto-fit */
    if (containerRef) {
      const ro = new ResizeObserver((entries) => {
        for (const e of entries) containerWidth = e.contentRect.width;
      });
      ro.observe(containerRef);
      containerWidth = containerRef.getBoundingClientRect().width;
      return () => ro.disconnect();
    }
  });

  /* ---- actions ---- */
  function handlePrint()    { if (typeof window !== 'undefined') window.print(); }
  function handleDownload() {
    if (typeof window === 'undefined') return;
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = window.document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^\w.-]+/g, '_') || 'screenplay'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div
  class="screenplay-viewer relative min-h-screen w-full overflow-x-hidden
         text-[color:var(--color-workspace-fg)] bg-[color:var(--color-workspace)] {className}"
  role="document"
  aria-label="Screenplay viewer"
  bind:this={containerRef}
>
  {#if showMenu}
    <Menu
      document={doc}
      {theme}
      {zoom}
      {lang}
      {title}
      totalPages={paginationResult.totalPages}
      availableLanguages={availableLanguages}
      onThemeChange={(t) => (theme = t)}
      onZoomChange={(z) => (zoom = z)}
      onLangChange={(l) => (lang = l)}
      onPrint={handlePrint}
      onDownload={handleDownload}
      onShowMetadata={() => (showMetadata = !showMetadata)}
    />
  {/if}

  <!-- Scrollable page stack, centered. Auto-fit shrinks pages on narrow viewports;
       user zoom is multiplied on top. We use CSS zoom (not transform: scale) so
       the layout flow contracts/expands with the visual. -->
  <div
    class="flex flex-col items-center py-[48px] px-4 sm:px-6"
    style="zoom: {effectiveZoom};"
  >
    {#each paginationResult.pages as page (page.number)}
      <Page {page} {numbered} {paginated} />
    {/each}
  </div>

  {#if showMetadata}
    <MetadataPanel
      document={doc}
      {lang}
      totalPages={paginationResult.totalPages}
      onClose={() => (showMetadata = false)}
    />
  {/if}
</div>
