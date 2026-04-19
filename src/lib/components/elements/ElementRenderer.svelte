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

  interface Props {
    element: PaginatedElement;
    numbered?: boolean;
  }

  let { element, numbered = false }: Props = $props();
</script>

<!-- Scene heading, rendered above the first element of any scene -->
{#if element.sceneHeading}
  <Slugline text={element.sceneHeading} sceneNumber={element.sceneNumber} {numbered} />
{/if}

<!-- Element body -->
{#if element.type === 'action'}
  <Action text={element.text} />
{:else if element.type === 'character'}
  <Character name={element.characterName ?? element.text} />
{:else if element.type === 'dialogue'}
  <!-- On a page continuation, re-emit the cue with (CONT'D). -->
  {#if element.isContinued && element.characterName}
    <Character name={element.characterName} />
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

<!-- (MORE) marker when an element is broken by a page -->
{#if element.hasMore}
  <p class="sp-element sp-character mt-1">(MORE)</p>
{/if}
