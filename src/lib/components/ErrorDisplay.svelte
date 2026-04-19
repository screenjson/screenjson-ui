<script lang="ts">
  import type { LoaderError } from '../services/errors';
  
  interface Props {
    error: LoaderError;
    theme?: 'light' | 'dark';
    onRetry?: () => void;
    class?: string;
  }
  
  let {
    error,
    theme = 'light',
    onRetry,
    class: className = ''
  }: Props = $props();
  
  const isDark = $derived(theme === 'dark');
</script>

<div 
  class="error-display {isDark ? 'dark' : ''} {className}"
>
  <div class="error-icon">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  </div>
  
  <h2 class="error-title">{error.title}</h2>
  
  <p class="error-message">{error.message}</p>
  
  {#if error.details}
    <div class="error-details">
      <pre>{error.details}</pre>
    </div>
  {/if}
  
  {#if error.suggestion}
    <p class="error-suggestion">
      <strong>Suggestion:</strong> {error.suggestion}
    </p>
  {/if}
  
  {#if error.technical}
    <details class="error-technical">
      <summary>Technical Details</summary>
      <pre>{error.technical}</pre>
    </details>
  {/if}
  
  {#if onRetry}
    <button class="retry-button" onclick={onRetry}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 mr-2">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
      Try Again
    </button>
  {/if}
</div>

<style>
  .error-display {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    margin: 0 auto;
    text-align: center;
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  .error-display.dark {
    background-color: #451a1a;
    border-color: #7f1d1d;
    color: #fecaca;
  }
  
  .error-icon {
    color: #dc2626;
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
  }
  
  .error-display.dark .error-icon {
    color: #f87171;
  }
  
  .error-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #991b1b;
    margin: 0 0 8px 0;
  }
  
  .error-display.dark .error-title {
    color: #fca5a5;
  }
  
  .error-message {
    color: #b91c1c;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }
  
  .error-display.dark .error-message {
    color: #fca5a5;
  }
  
  .error-details {
    background-color: #fee2e2;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 16px;
    text-align: left;
  }
  
  .error-display.dark .error-details {
    background-color: #7f1d1d;
  }
  
  .error-details pre {
    margin: 0;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: 'Courier Prime', monospace;
  }
  
  .error-suggestion {
    color: #92400e;
    font-size: 14px;
    margin: 0 0 16px 0;
    padding: 12px;
    background-color: #fef3c7;
    border-radius: 6px;
    text-align: left;
  }
  
  .error-display.dark .error-suggestion {
    background-color: #78350f;
    color: #fde68a;
  }
  
  .error-technical {
    text-align: left;
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 16px;
  }
  
  .error-display.dark .error-technical {
    color: #9ca3af;
  }
  
  .error-technical summary {
    cursor: pointer;
    padding: 8px;
    background-color: #f3f4f6;
    border-radius: 4px;
  }
  
  .error-display.dark .error-technical summary {
    background-color: #374151;
  }
  
  .error-technical pre {
    margin-top: 8px;
    padding: 8px;
    background-color: #f9fafb;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: 'Courier Prime', monospace;
  }
  
  .error-display.dark .error-technical pre {
    background-color: #1f2937;
  }
  
  .retry-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .retry-button:hover {
    background-color: #1d4ed8;
  }
</style>
