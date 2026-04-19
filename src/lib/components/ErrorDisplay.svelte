<script lang="ts">
  import type { LoaderError } from '../services/errors';

  interface Props {
    error: LoaderError | string;
    onRetry?: () => void;
  }

  let { error, onRetry }: Props = $props();

  const title   = $derived(typeof error === 'string' ? 'Something went wrong' : (error.title ?? 'Error'));
  const message = $derived(typeof error === 'string' ? error : error.message);
  const hint    = $derived(typeof error === 'string' ? null    : error.suggestion);
</script>

<div class="flex items-center justify-center min-h-screen p-4 font-sans">
  <div
    class="max-w-md w-full rounded-lg border bg-[color:var(--color-ui-bg)]
           text-[color:var(--color-ui-fg)] border-[color:var(--color-ui-border)] shadow-sm p-6"
    role="alert"
  >
    <div class="flex items-center gap-2 mb-3">
      <svg viewBox="0 0 24 24" class="h-5 w-5 text-[color:var(--color-brand-500)]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <h2 class="font-semibold text-base">{title}</h2>
    </div>

    <p class="text-sm text-[color:var(--color-ui-fg)] mb-2">{message}</p>

    {#if hint}
      <p class="text-sm text-[color:var(--color-ui-muted)]">{hint}</p>
    {/if}

    {#if onRetry}
      <button
        type="button"
        class="mt-4 inline-flex items-center gap-2 rounded-md border border-[color:var(--color-ui-border)] px-3 h-9 text-sm hover:bg-[color:var(--color-ui-hover)]"
        onclick={onRetry}
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        Retry
      </button>
    {/if}
  </div>
</div>
