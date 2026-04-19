<script lang="ts">
  import type { PaginatedElement } from '../../services/paginator';
  import Action from './Action.svelte';
  import Character from './Character.svelte';
  import Dialogue from './Dialogue.svelte';
  import General from './General.svelte';
  import Parenthetical from './Parenthetical.svelte';
  import Shot from './Shot.svelte';
  import Slugline from './Slugline.svelte';
  import Transition from './Transition.svelte';
  import { MARGINS } from '../../constants/formatting';
  
  interface Props {
    element: PaginatedElement;
    numbered?: boolean;
    class?: string;
  }
  
  let { 
    element, 
    numbered = false,
    class: className = '' 
  }: Props = $props();
</script>

<div class="element-wrapper {className}">
  {#if element.sceneHeading}
    <Slugline 
      text={element.sceneHeading} 
      sceneNumber={element.sceneNumber}
      {numbered}
    />
  {/if}
  
  {#if element.type === 'action'}
    <Action text={element.text} />
  {:else if element.type === 'character'}
    <Character 
      name={element.characterName ?? element.text}
      extension={element.isContinued ? "(CONT'D)" : undefined}
    />
  {:else if element.type === 'dialogue'}
    {#if element.characterName && !element.isContinued}
      <Character name={element.characterName} />
    {:else if element.characterName && element.isContinued}
      <Character name={element.characterName} extension="(CONT'D)" />
    {/if}
    <Dialogue text={element.text} />
  {:else if element.type === 'parenthetical'}
    <Parenthetical text={element.text} />
  {:else if element.type === 'transition'}
    <Transition text={element.text} />
  {:else if element.type === 'shot'}
    <Shot text={element.text} />
  {:else if element.type === 'general'}
    <General text={element.text} />
  {/if}
  
  {#if element.hasMore}
    <div 
      class="more-indicator"
      style="margin-left: {MARGINS.character.left}in;"
    >
      (MORE)
    </div>
  {/if}
</div>

<style>
  .element-wrapper {
    font-family: var(--font-screenplay);
  }
  
  .more-indicator {
    font-family: var(--font-screenplay);
    font-size: 12pt;
    line-height: 1;
    margin-top: 0.167in;
  }
</style>
