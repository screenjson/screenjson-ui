<script lang="ts">
  import type { ScreenJSONDocument, Lang } from '../types/screenjson';
  import { getText } from '../types/screenjson';

  interface Props {
    document: ScreenJSONDocument;
    lang: Lang;
    totalPages: number;
    onClose: () => void;
  }

  let { document, lang, totalPages, onClose }: Props = $props();

  let tab = $state<'overview' | 'characters' | 'scenes'>('overview');

  const stats = $derived.by(() => {
    const scenes = document.document.scenes;
    let dialogue = 0;
    let action = 0;
    const charLines: Record<string, number> = {};

    for (const scene of scenes) {
      for (const el of scene.body) {
        if (el.type === 'dialogue') {
          dialogue++;
          if ('character' in el && el.character) {
            charLines[el.character] = (charLines[el.character] ?? 0) + 1;
          }
        } else if (el.type === 'action') {
          action++;
        }
      }
    }

    const ranked = (document.characters ?? [])
      .map((c) => ({ ...c, lines: charLines[c.id] ?? 0 }))
      .sort((a, b) => b.lines - a.lines);

    return { scenes: scenes.length, dialogue, action, ranked };
  });

  function close(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={close} />

<div
  class="no-print fixed inset-0 z-50 flex justify-end"
  role="dialog"
  aria-modal="true"
  aria-label="Document metadata"
>
  <button
    aria-label="Close metadata"
    class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
    onclick={onClose}
  ></button>

  <aside
    class="relative w-full sm:w-[420px] h-full overflow-y-auto
           bg-[color:var(--color-ui-bg)] text-[color:var(--color-ui-fg)]
           border-l border-[color:var(--color-ui-border)] shadow-2xl"
  >
    <header class="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 h-12 border-b border-[color:var(--color-ui-border)] bg-[color:var(--color-ui-bg)]">
      <h2 class="font-sans text-sm font-semibold">Metadata</h2>
      <button
        type="button"
        class="h-8 w-8 rounded-md flex items-center justify-center hover:bg-[color:var(--color-ui-hover)]"
        aria-label="Close"
        onclick={onClose}
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </header>

    <nav class="flex gap-0.5 px-2 pt-2 font-sans text-xs" aria-label="Metadata tabs">
      {#each [['overview','Overview'], ['characters','Characters'], ['scenes','Scenes']] as const as [id, label]}
        <button
          type="button"
          class:!bg-[color:var(--color-ui-hover)]={tab === id}
          class:!font-semibold={tab === id}
          class="px-3 h-8 rounded-md hover:bg-[color:var(--color-ui-hover)]"
          onclick={() => (tab = id)}
        >{label}</button>
      {/each}
    </nav>

    <div class="p-4 font-sans text-sm space-y-4">
      {#if tab === 'overview'}
        <dl class="grid grid-cols-2 gap-2">
          <div class="rounded-md border border-[color:var(--color-ui-border)] p-3">
            <dt class="text-[11px] uppercase tracking-wide text-[color:var(--color-ui-muted)]">Pages</dt>
            <dd class="text-2xl font-bold tabular-nums">{totalPages}</dd>
          </div>
          <div class="rounded-md border border-[color:var(--color-ui-border)] p-3">
            <dt class="text-[11px] uppercase tracking-wide text-[color:var(--color-ui-muted)]">Scenes</dt>
            <dd class="text-2xl font-bold tabular-nums">{stats.scenes}</dd>
          </div>
          <div class="rounded-md border border-[color:var(--color-ui-border)] p-3">
            <dt class="text-[11px] uppercase tracking-wide text-[color:var(--color-ui-muted)]">Dialogue</dt>
            <dd class="text-2xl font-bold tabular-nums">{stats.dialogue}</dd>
          </div>
          <div class="rounded-md border border-[color:var(--color-ui-border)] p-3">
            <dt class="text-[11px] uppercase tracking-wide text-[color:var(--color-ui-muted)]">Action lines</dt>
            <dd class="text-2xl font-bold tabular-nums">{stats.action}</dd>
          </div>
        </dl>

        <div class="space-y-1.5 text-[13px]">
          {#if document.authors?.length}
            <p class="text-[color:var(--color-ui-muted)]">Authors:
              <span class="text-[color:var(--color-ui-fg)]">
                {document.authors.map((a) => a.given + ' ' + a.family).join(', ')}
              </span>
            </p>
          {/if}
          {#if document.logline}
            <p class="text-[color:var(--color-ui-muted)]">Logline:
              <span class="text-[color:var(--color-ui-fg)]">{getText(document.logline, lang)}</span>
            </p>
          {/if}
          {#if document.version}
            <p class="text-[color:var(--color-ui-muted)]">Schema version: <span class="text-[color:var(--color-ui-fg)] tabular-nums">{document.version}</span></p>
          {/if}
        </div>
      {:else if tab === 'characters'}
        <ul class="divide-y divide-[color:var(--color-ui-border)]">
          {#each stats.ranked as c (c.id)}
            <li class="py-2 flex items-center justify-between gap-2">
              <span class="font-[var(--font-screenplay)] uppercase">{c.name}</span>
              <span class="text-xs tabular-nums text-[color:var(--color-ui-muted)]">{c.lines} {c.lines === 1 ? 'line' : 'lines'}</span>
            </li>
          {/each}
          {#if stats.ranked.length === 0}
            <li class="py-2 text-[color:var(--color-ui-muted)]">No characters declared.</li>
          {/if}
        </ul>
      {:else}
        <ol class="space-y-1.5 text-[13px]">
          {#each document.document.scenes as scene, i (scene.id)}
            <li class="flex gap-2">
              <span class="w-8 shrink-0 tabular-nums text-[color:var(--color-ui-muted)]">{scene.heading?.no ?? (i + 1)}</span>
              <span class="truncate">
                <span class="font-bold uppercase">{scene.heading?.context ?? ''}</span>
                {scene.heading?.setting ?? ''}
                <span class="text-[color:var(--color-ui-muted)]">— {scene.heading?.time ?? ''}</span>
              </span>
            </li>
          {/each}
        </ol>
      {/if}
    </div>
  </aside>
</div>
