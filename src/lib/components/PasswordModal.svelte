<script lang="ts">
  interface Props {
    title?: string;
    error?: string;
    onSubmit: (password: string) => void;
    onCancel?: () => void;
  }

  let { title = 'Enter password', error, onSubmit, onCancel }: Props = $props();

  let password = $state('');

  function submit(e: Event) {
    e.preventDefault();
    if (password.length > 0) onSubmit(password);
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-sans"
  role="dialog"
  aria-modal="true"
>
  <form
    class="w-full max-w-sm rounded-lg border
           bg-[color:var(--color-ui-bg)] text-[color:var(--color-ui-fg)]
           border-[color:var(--color-ui-border)] shadow-xl p-5"
    onsubmit={submit}
  >
    <h2 class="font-semibold text-base mb-3">{title}</h2>

    <label class="block text-xs font-medium text-[color:var(--color-ui-muted)] mb-1" for="sj-pw">
      Password
    </label>
    <input
      id="sj-pw"
      type="password"
      autocomplete="current-password"
      bind:value={password}
      class="w-full h-10 rounded-md border border-[color:var(--color-ui-border)] px-3 text-sm
             bg-transparent text-[color:var(--color-ui-fg)]
             focus:border-[color:var(--color-brand-500)] focus:ring-2 focus:ring-[color:var(--color-brand-500)]/30 outline-none"
      data-1p-ignore
    />

    {#if error}
      <p class="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
    {/if}

    <div class="mt-4 flex items-center justify-end gap-2">
      {#if onCancel}
        <button
          type="button"
          class="h-9 px-3 rounded-md border border-[color:var(--color-ui-border)] text-sm hover:bg-[color:var(--color-ui-hover)]"
          onclick={onCancel}
        >Cancel</button>
      {/if}
      <button
        type="submit"
        class="h-9 px-4 rounded-md text-sm font-semibold text-white
               bg-[color:var(--color-brand-500)] hover:opacity-95 disabled:opacity-40"
        disabled={password.length === 0}
      >Decrypt</button>
    </div>
  </form>
</div>
