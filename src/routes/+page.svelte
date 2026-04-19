<script lang="ts">
  import { onMount } from 'svelte';
  import Viewer from '$lib/components/Viewer.svelte';
  import { base } from '$app/paths';
  import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
  import type { ScreenJSONDocument } from '$lib/types/screenjson';

  type Loader =
    | { kind: 'idle' }
    | { kind: 'loading'; label: string }
    | { kind: 'ready'; doc: ScreenJSONDocument; source: string }
    | { kind: 'error'; title: string; message: string; hint?: string };

  const EXAMPLES: Array<{ id: string; name: string; path: string; blurb: string }> = [
    { id: 'sampler', name: 'Sampler',           path: base + '/examples/sampler.json',         blurb: 'Synthetic doc with every element type.' },
    { id: 'hgf',     name: 'His Girl Friday',   path: base + '/examples/his-girl-friday.json', blurb: 'Charles Lederer, 1940 — full FDX import.' }
  ];

  let state = $state<Loader>({ kind: 'idle' });
  let activeExample = $state<string | null>(null);
  let urlInput = $state('');
  let sidebarOpen = $state(true);

  async function loadPath(path: string, label: string, id?: string) {
    state = { kind: 'loading', label };
    activeExample = id ?? null;
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const doc = (await res.json()) as ScreenJSONDocument;
      if (!doc || !doc.document || !Array.isArray(doc.document.scenes)) {
        throw new Error('Not a valid ScreenJSON document.');
      }
      state = { kind: 'ready', doc, source: label };
    } catch (err) {
      state = {
        kind: 'error',
        title: 'Failed to load',
        message: err instanceof Error ? err.message : String(err),
        hint: 'Check the URL and that the file is publicly accessible (CORS).'
      };
    }
  }

  async function loadFile(file: File) {
    state = { kind: 'loading', label: file.name };
    activeExample = null;
    try {
      const text = await file.text();
      const doc = JSON.parse(text) as ScreenJSONDocument;
      if (!doc || !doc.document || !Array.isArray(doc.document.scenes)) {
        throw new Error('Not a valid ScreenJSON document.');
      }
      state = { kind: 'ready', doc, source: file.name };
    } catch (err) {
      state = {
        kind: 'error',
        title: 'Could not parse file',
        message: err instanceof Error ? err.message : String(err)
      };
    }
  }

  function onFileInput(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) loadFile(f);
  }

  function onUrlSubmit(e: Event) {
    e.preventDefault();
    const u = urlInput.trim();
    if (u) loadPath(u, u);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) loadFile(f);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
  }

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const src = params.get('src');
    if (src) {
      loadPath(src, src);
    } else {
      loadPath(EXAMPLES[0].path, EXAMPLES[0].name, EXAMPLES[0].id);
    }
  });
</script>

<svelte:window on:drop={onDrop} on:dragover={onDragOver} />

<div class="min-h-screen flex flex-col sm:flex-row font-[var(--font-screenplay)]">
  <!-- Sidebar -->
  {#if sidebarOpen}
    <aside
      class="no-print w-full sm:w-72 shrink-0 border-b sm:border-b-0 sm:border-r
             border-[color:var(--color-ui-border)] bg-[color:var(--color-ui-bg)]
             text-[color:var(--color-ui-fg)] font-sans"
    >
      <header class="flex items-center justify-between gap-2 px-4 h-12 border-b border-[color:var(--color-ui-border)]">
        <div class="flex items-center gap-2">
          <span
            aria-hidden="true"
            class="inline-flex h-7 w-7 items-center justify-center
                   bg-[color:var(--color-brand-500)] text-white text-[10px] font-black tracking-tight"
          >SJ</span>
          <span class="text-sm font-semibold">ScreenJSON UI</span>
        </div>
        <button
          type="button"
          class="h-8 w-8 rounded-md flex items-center justify-center hover:bg-[color:var(--color-ui-hover)]"
          onclick={() => (sidebarOpen = false)}
          aria-label="Hide sidebar"
          title="Hide sidebar"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      <div class="p-4 space-y-6 text-sm">
        <section>
          <h2 class="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-ui-muted)] mb-2">
            Examples
          </h2>
          <ul class="space-y-1">
            {#each EXAMPLES as ex (ex.id)}
              <li>
                <button
                  type="button"
                  class:active-example={activeExample === ex.id}
                  class="w-full text-left px-3 py-2 rounded-md border border-transparent
                         hover:border-[color:var(--color-ui-border)] hover:bg-[color:var(--color-ui-hover)]
                         transition-colors"
                  onclick={() => loadPath(ex.path, ex.name, ex.id)}
                >
                  <div class="font-semibold">{ex.name}</div>
                  <div class="text-[11px] text-[color:var(--color-ui-muted)] mt-0.5">{ex.blurb}</div>
                </button>
              </li>
            {/each}
          </ul>
        </section>

        <section>
          <h2 class="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-ui-muted)] mb-2">
            Upload .json
          </h2>
          <label
            class="block rounded-md border-2 border-dashed border-[color:var(--color-ui-border)]
                   p-4 text-center cursor-pointer hover:border-[color:var(--color-brand-500)] transition-colors"
          >
            <input type="file" accept=".json,application/json" class="sr-only" onchange={onFileInput} />
            <span class="inline-flex items-center gap-2 text-[color:var(--color-ui-muted)]">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Click or drop a file</span>
            </span>
          </label>
        </section>

        <section>
          <h2 class="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-ui-muted)] mb-2">
            Load from URL
          </h2>
          <form onsubmit={onUrlSubmit} class="flex items-stretch gap-1">
            <input
              type="url"
              bind:value={urlInput}
              placeholder="https://example.com/script.json"
              class="flex-1 h-9 rounded-md border border-[color:var(--color-ui-border)] px-3 text-xs
                     bg-transparent text-[color:var(--color-ui-fg)]
                     focus:border-[color:var(--color-brand-500)] focus:ring-2 focus:ring-[color:var(--color-brand-500)]/30 outline-none"
            />
            <button
              type="submit"
              class="h-9 px-3 rounded-md text-xs font-semibold text-white
                     bg-[color:var(--color-brand-500)] hover:opacity-95 disabled:opacity-40"
              disabled={urlInput.trim() === ''}
            >Load</button>
          </form>
        </section>

        <section class="pt-2 border-t border-[color:var(--color-ui-border)] text-[11px] text-[color:var(--color-ui-muted)] leading-relaxed">
          <p>
            Keyboard: <span class="kbd">↑</span> <span class="kbd">↓</span> scroll.
            Paste <span class="kbd">?src=URL</span> in the address bar to deep-link.
          </p>
          <p class="mt-2">
            Docs at
            <a class="underline decoration-[color:var(--color-brand-500)]"
               href="https://docs.screenjson.com">docs.screenjson.com</a>.
          </p>
        </section>
      </div>
    </aside>
  {/if}

  <!-- Main -->
  <main class="flex-1 min-w-0">
    <!-- Mobile sidebar toggle -->
    {#if !sidebarOpen}
      <button
        type="button"
        class="no-print fixed top-1/2 left-0 -translate-y-1/2 z-50 h-12 w-7 rounded-r-md
               bg-[color:var(--color-ui-bg)] text-[color:var(--color-ui-muted)] hover:text-[color:var(--color-ui-fg)]
               border border-l-0 border-[color:var(--color-ui-border)] shadow-md flex items-center justify-center"
        onclick={() => (sidebarOpen = true)}
        aria-label="Show sidebar"
        title="Show sidebar"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    {/if}

    {#if state.kind === 'loading'}
      <div class="flex items-center justify-center min-h-screen font-sans text-sm text-[color:var(--color-ui-muted)]">
        <div class="text-center">
          <div class="h-10 w-10 mx-auto mb-3 rounded-full border-2 border-[color:var(--color-ui-border)] border-t-[color:var(--color-brand-500)] animate-spin"></div>
          Loading {state.label}…
        </div>
      </div>
    {:else if state.kind === 'error'}
      <ErrorDisplay
        error={{ code: 'UNKNOWN', title: state.title, message: state.message, suggestion: state.hint } as any}
        onRetry={() => {
          if (activeExample) {
            const ex = EXAMPLES.find((e) => e.id === activeExample);
            if (ex) loadPath(ex.path, ex.name, ex.id);
          }
        }}
      />
    {:else if state.kind === 'ready'}
      <Viewer document={state.doc} />
    {/if}
  </main>
</div>

<style>
  :global(.active-example) {
    border-color: var(--color-brand-500) !important;
    background: color-mix(in oklab, var(--color-brand-500) 14%, transparent) !important;
  }
  :where(html.dark) :global(.active-example) {
    background: color-mix(in oklab, var(--color-brand-500) 28%, transparent) !important;
  }
  :global(.kbd) {
    font-family: var(--font-screenplay);
    display: inline-block;
    padding: 1px 5px;
    border: 1px solid var(--color-ui-border);
    border-bottom-width: 2px;
    border-radius: 3px;
    font-size: 10px;
  }
</style>
