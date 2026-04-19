<script lang="ts">
  import { validatePassword } from '../services/crypto';
  
  interface Props {
    isOpen: boolean;
    theme?: 'light' | 'dark';
    onSubmit: (password: string) => void;
    onCancel: () => void;
    error?: string;
    class?: string;
  }
  
  let {
    isOpen,
    theme = 'light',
    onSubmit,
    onCancel,
    error: externalError,
    class: className = ''
  }: Props = $props();
  
  let password = $state('');
  let showPassword = $state(false);
  let validationError = $state<string | null>(null);
  
  const isDark = $derived(theme === 'dark');
  const displayError = $derived(externalError ?? validationError);
  
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    
    const validation = validatePassword(password);
    if (!validation.valid) {
      validationError = validation.error ?? 'Invalid password';
      return;
    }
    
    validationError = null;
    onSubmit(password);
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onCancel();
    }
  }
  
  function toggleShowPassword() {
    showPassword = !showPassword;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal-overlay {className}" onclick={onCancel}>
    <div 
      class="modal-content {isDark ? 'dark' : ''}"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-modal-title"
    >
      <div class="modal-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-blue-500">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <h2 id="password-modal-title" class="modal-title">Encrypted Document</h2>
      </div>
      
      <p class="modal-description">
        This screenplay contains encrypted content. Please enter the password to decrypt and view.
      </p>
      
      <form onsubmit={handleSubmit}>
        <div class="input-group">
          <label for="password" class="input-label">Password</label>
          <div class="input-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              placeholder="Enter password"
              class="password-input {isDark ? 'dark' : ''}"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="toggle-visibility"
              onclick={toggleShowPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {#if showPassword}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              {/if}
            </button>
          </div>
        </div>
        
        {#if displayError}
          <div class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {displayError}
          </div>
        {/if}
        
        <div class="button-group">
          <button
            type="button"
            class="btn btn-secondary {isDark ? 'dark' : ''}"
            onclick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
          >
            Decrypt
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 16px;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  .modal-content.dark {
    background-color: #1f2937;
    color: white;
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }
  
  .modal-description {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 20px;
    line-height: 1.5;
  }
  
  .modal-content.dark .modal-description {
    color: #9ca3af;
  }
  
  .input-group {
    margin-bottom: 16px;
  }
  
  .input-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
  }
  
  .input-wrapper {
    position: relative;
  }
  
  .password-input {
    width: 100%;
    padding: 10px 40px 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    font-family: var(--font-screenplay);
  }
  
  .password-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .password-input.dark {
    background-color: #374151;
    border-color: #4b5563;
    color: white;
  }
  
  .toggle-visibility {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 4px;
  }
  
  .toggle-visibility:hover {
    color: #374151;
  }
  
  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #dc2626;
    font-size: 14px;
    margin-bottom: 16px;
    padding: 8px 12px;
    background-color: #fef2f2;
    border-radius: 6px;
  }
  
  .modal-content.dark .error-message {
    background-color: #7f1d1d;
    color: #fecaca;
  }
  
  .button-group {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-primary {
    background-color: #2563eb;
    color: white;
    border: none;
  }
  
  .btn-primary:hover {
    background-color: #1d4ed8;
  }
  
  .btn-secondary {
    background-color: white;
    color: #374151;
    border: 1px solid #d1d5db;
  }
  
  .btn-secondary:hover {
    background-color: #f3f4f6;
  }
  
  .btn-secondary.dark {
    background-color: #374151;
    border-color: #4b5563;
    color: white;
  }
  
  .btn-secondary.dark:hover {
    background-color: #4b5563;
  }
</style>
