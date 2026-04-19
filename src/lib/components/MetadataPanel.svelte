<script lang="ts">
  import type { ScreenJSONDocument, Lang, Character, Author, Scene } from '../types/screenjson';
  import { getText } from '../types/screenjson';
  
  interface Props {
    document: ScreenJSONDocument;
    lang: Lang;
    isOpen: boolean;
    theme?: 'light' | 'dark';
    onClose: () => void;
    onNavigateToScene?: (sceneId: string) => void;
    class?: string;
  }
  
  let {
    document,
    lang,
    isOpen,
    theme = 'light',
    onClose,
    onNavigateToScene,
    class: className = ''
  }: Props = $props();
  
  let activeTab = $state<'overview' | 'characters' | 'scenes' | 'breakdown'>('overview');
  
  const isDark = $derived(theme === 'dark');
  
  // Computed stats
  const stats = $derived.by(() => {
    const scenes = document.document.scenes;
    let totalElements = 0;
    let dialogueCount = 0;
    let actionCount = 0;
    
    const characterAppearances = new Map<string, number>();
    const locations = new Set<string>();
    const allSfx = new Set<string>();
    const allVfx = new Set<string>();
    const allProps = new Set<string>();
    const allWardrobe = new Set<string>();
    
    for (const scene of scenes) {
      totalElements += scene.body.length;
      locations.add(scene.heading.setting);
      
      // Count tags
      scene.sfx?.forEach((s) => allSfx.add(s));
      scene.vfx?.forEach((v) => allVfx.add(v));
      scene.props?.forEach((p) => allProps.add(p));
      scene.wardrobe?.forEach((w) => allWardrobe.add(w));
      
      for (const element of scene.body) {
        if (element.type === 'dialogue') {
          dialogueCount++;
          const charId = element.character;
          characterAppearances.set(
            charId,
            (characterAppearances.get(charId) ?? 0) + 1
          );
        } else if (element.type === 'action') {
          actionCount++;
        }
      }
    }
    
    return {
      sceneCount: scenes.length,
      totalElements,
      dialogueCount,
      actionCount,
      characterCount: document.characters?.length ?? 0,
      locationCount: locations.size,
      characterAppearances,
      locations: Array.from(locations),
      sfx: Array.from(allSfx),
      vfx: Array.from(allVfx),
      props: Array.from(allProps),
      wardrobe: Array.from(allWardrobe)
    };
  });
  
  // Characters sorted by appearances
  const sortedCharacters = $derived.by(() => {
    const characters = document.characters ?? [];
    const appearances = stats.characterAppearances;
    
    return [...characters].sort((a, b) => {
      const aCount = appearances.get(a.id) ?? 0;
      const bCount = appearances.get(b.id) ?? 0;
      return bCount - aCount;
    });
  });
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="panel-overlay {className}" onclick={onClose}>
    <div 
      class="panel-content {isDark ? 'dark' : ''}"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="metadata-panel-title"
    >
      <div class="panel-header">
        <h2 id="metadata-panel-title" class="panel-title">Document Metadata</h2>
        <button class="close-btn" onclick={onClose} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab {activeTab === 'overview' ? 'active' : ''}"
          onclick={() => activeTab = 'overview'}
        >
          Overview
        </button>
        <button 
          class="tab {activeTab === 'characters' ? 'active' : ''}"
          onclick={() => activeTab = 'characters'}
        >
          Characters
        </button>
        <button 
          class="tab {activeTab === 'scenes' ? 'active' : ''}"
          onclick={() => activeTab = 'scenes'}
        >
          Scenes
        </button>
        <button 
          class="tab {activeTab === 'breakdown' ? 'active' : ''}"
          onclick={() => activeTab = 'breakdown'}
        >
          Breakdown
        </button>
      </div>
      
      <!-- Tab Content -->
      <div class="tab-content">
        {#if activeTab === 'overview'}
          <div class="overview">
            <div class="info-row">
              <span class="label">Title</span>
              <span class="value">{getText(document.title, lang)}</span>
            </div>
            
            {#if document.logline}
              <div class="info-row">
                <span class="label">Logline</span>
                <span class="value logline">{getText(document.logline, lang)}</span>
              </div>
            {/if}
            
            <div class="info-row">
              <span class="label">Authors</span>
              <span class="value">
                {document.authors.map((a) => `${a.given} ${a.family}`).join(', ')}
              </span>
            </div>
            
            {#if document.genre && document.genre.length > 0}
              <div class="info-row">
                <span class="label">Genre</span>
                <span class="value">{document.genre.join(', ')}</span>
              </div>
            {/if}
            
            <div class="stats-grid">
              <div class="stat">
                <span class="stat-value">{stats.sceneCount}</span>
                <span class="stat-label">Scenes</span>
              </div>
              <div class="stat">
                <span class="stat-value">{stats.characterCount}</span>
                <span class="stat-label">Characters</span>
              </div>
              <div class="stat">
                <span class="stat-value">{stats.dialogueCount}</span>
                <span class="stat-label">Dialogue Lines</span>
              </div>
              <div class="stat">
                <span class="stat-value">{stats.locationCount}</span>
                <span class="stat-label">Locations</span>
              </div>
            </div>
          </div>
        
        {:else if activeTab === 'characters'}
          <div class="characters-list">
            {#each sortedCharacters as character}
              <div class="character-item">
                <span class="character-name">{character.name}</span>
                <span class="character-count">
                  {stats.characterAppearances.get(character.id) ?? 0} lines
                </span>
              </div>
            {/each}
          </div>
        
        {:else if activeTab === 'scenes'}
          <div class="scenes-list">
            {#each document.document.scenes as scene, index}
              <button 
                class="scene-item"
                onclick={() => onNavigateToScene?.(scene.id)}
              >
                <span class="scene-number">{scene.heading.no ?? index + 1}</span>
                <span class="scene-heading">
                  {scene.heading.context}. {scene.heading.setting} - {scene.heading.time}
                </span>
              </button>
            {/each}
          </div>
        
        {:else if activeTab === 'breakdown'}
          <div class="breakdown">
            {#if stats.locations.length > 0}
              <div class="breakdown-section">
                <h3 class="breakdown-title">Locations ({stats.locations.length})</h3>
                <div class="tag-list">
                  {#each stats.locations as location}
                    <span class="tag">{location}</span>
                  {/each}
                </div>
              </div>
            {/if}
            
            {#if stats.sfx.length > 0}
              <div class="breakdown-section">
                <h3 class="breakdown-title">SFX ({stats.sfx.length})</h3>
                <div class="tag-list">
                  {#each stats.sfx as sfx}
                    <span class="tag tag-sfx">{sfx}</span>
                  {/each}
                </div>
              </div>
            {/if}
            
            {#if stats.vfx.length > 0}
              <div class="breakdown-section">
                <h3 class="breakdown-title">VFX ({stats.vfx.length})</h3>
                <div class="tag-list">
                  {#each stats.vfx as vfx}
                    <span class="tag tag-vfx">{vfx}</span>
                  {/each}
                </div>
              </div>
            {/if}
            
            {#if stats.props.length > 0}
              <div class="breakdown-section">
                <h3 class="breakdown-title">Props ({stats.props.length})</h3>
                <div class="tag-list">
                  {#each stats.props as prop}
                    <span class="tag tag-prop">{prop}</span>
                  {/each}
                </div>
              </div>
            {/if}
            
            {#if stats.wardrobe.length > 0}
              <div class="breakdown-section">
                <h3 class="breakdown-title">Wardrobe ({stats.wardrobe.length})</h3>
                <div class="tag-list">
                  {#each stats.wardrobe as item}
                    <span class="tag tag-wardrobe">{item}</span>
                  {/each}
                </div>
              </div>
            {/if}
            
            {#if stats.sfx.length === 0 && stats.vfx.length === 0 && stats.props.length === 0 && stats.wardrobe.length === 0}
              <p class="no-data">No breakdown data available in this document.</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .panel-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 16px;
  }
  
  .panel-content {
    background-color: white;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  .panel-content.dark {
    background-color: #1f2937;
    color: white;
  }
  
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .panel-content.dark .panel-header {
    border-color: #374151;
  }
  
  .panel-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }
  
  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 4px;
  }
  
  .close-btn:hover {
    color: #374151;
  }
  
  .tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    padding: 0 20px;
  }
  
  .panel-content.dark .tabs {
    border-color: #374151;
  }
  
  .tab {
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: #6b7280;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }
  
  .tab:hover {
    color: #374151;
  }
  
  .tab.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }
  
  .panel-content.dark .tab {
    color: #9ca3af;
  }
  
  .panel-content.dark .tab:hover,
  .panel-content.dark .tab.active {
    color: #60a5fa;
    border-bottom-color: #60a5fa;
  }
  
  .tab-content {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }
  
  /* Overview Tab */
  .info-row {
    display: flex;
    margin-bottom: 12px;
  }
  
  .label {
    width: 100px;
    flex-shrink: 0;
    font-weight: 500;
    color: #6b7280;
    font-size: 14px;
  }
  
  .value {
    flex: 1;
    font-size: 14px;
  }
  
  .logline {
    font-style: italic;
    color: #6b7280;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }
  
  .panel-content.dark .stats-grid {
    border-color: #374151;
  }
  
  .stat {
    text-align: center;
    padding: 16px;
    background-color: #f9fafb;
    border-radius: 8px;
  }
  
  .panel-content.dark .stat {
    background-color: #374151;
  }
  
  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #2563eb;
  }
  
  .stat-label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
  }
  
  /* Characters Tab */
  .characters-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .character-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 12px;
    background-color: #f9fafb;
    border-radius: 6px;
  }
  
  .panel-content.dark .character-item {
    background-color: #374151;
  }
  
  .character-name {
    font-weight: 500;
    font-family: var(--font-screenplay);
    text-transform: uppercase;
  }
  
  .character-count {
    color: #6b7280;
    font-size: 14px;
  }
  
  /* Scenes Tab */
  .scenes-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .scene-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: none;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s;
  }
  
  .scene-item:hover {
    background-color: #f9fafb;
  }
  
  .panel-content.dark .scene-item {
    border-color: #374151;
    color: white;
  }
  
  .panel-content.dark .scene-item:hover {
    background-color: #374151;
  }
  
  .scene-number {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e5e7eb;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .panel-content.dark .scene-number {
    background-color: #4b5563;
  }
  
  .scene-heading {
    font-family: var(--font-screenplay);
    font-size: 13px;
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Breakdown Tab */
  .breakdown-section {
    margin-bottom: 20px;
  }
  
  .breakdown-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 10px 0;
    color: #374151;
  }
  
  .panel-content.dark .breakdown-title {
    color: #e5e7eb;
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .tag {
    padding: 4px 10px;
    background-color: #e5e7eb;
    border-radius: 9999px;
    font-size: 12px;
    text-transform: uppercase;
  }
  
  .panel-content.dark .tag {
    background-color: #4b5563;
  }
  
  .tag-sfx { background-color: #fef3c7; color: #92400e; }
  .tag-vfx { background-color: #dbeafe; color: #1e40af; }
  .tag-prop { background-color: #dcfce7; color: #166534; }
  .tag-wardrobe { background-color: #fce7f3; color: #9d174d; }
  
  .no-data {
    color: #6b7280;
    font-size: 14px;
    text-align: center;
    padding: 40px;
  }
</style>
