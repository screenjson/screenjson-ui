<script lang="ts">
  import { onMount } from 'svelte';
  import { ScreenJSONViewer } from '$lib';
  import type { ScreenJSONDocument } from '$lib/types/screenjson';

  let document: ScreenJSONDocument | null = $state(null);
  let error: string | null = $state(null);
  let loading = $state(true);

  // Get source from URL query params
  function getSourceFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('src');
  }

  // Get theme from URL query params
  function getThemeFromUrl(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    const params = new URLSearchParams(window.location.search);
    const theme = params.get('theme');
    return theme === 'dark' ? 'dark' : 'light';
  }

  let theme = $state<'light' | 'dark'>('light');

  onMount(async () => {
    theme = getThemeFromUrl();
    const src = getSourceFromUrl();
    
    if (!src) {
      // Default demo - load first example file
      try {
        const response = await fetch('/69beb802-c6db-4653-9cb8-1dbd36ad6acf.json');
        if (!response.ok) {
          throw new Error(`Failed to load demo: ${response.status}`);
        }
        document = await response.json();
      } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load demo document';
      }
    } else {
      try {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.status} ${response.statusText}`);
        }
        document = await response.json();
      } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load document';
      }
    }
    
    loading = false;
  });
</script>

<svelte:head>
  <title>{document?.title?.en ?? 'ScreenJSON Viewer'}</title>
</svelte:head>

<div class="min-h-screen bg-gray-300 dark:bg-gray-900">
  {#if loading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400 font-mono">Loading screenplay...</p>
      </div>
    </div>
  {:else if error}
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
        <h2 class="text-red-800 font-bold text-lg mb-2">Error Loading Document</h2>
        <p class="text-red-700">{error}</p>
        <p class="text-red-600 text-sm mt-4">
          Make sure the document URL is correct and accessible.
        </p>
      </div>
    </div>
  {:else if document}
    <ScreenJSONViewer {document} {theme} />
  {/if}
</div>
