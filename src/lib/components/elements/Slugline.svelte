<script lang="ts">
  interface Props {
    text: string;
    sceneNumber?: number | string;
    numbered?: boolean;
    class?: string;
  }
  let { text, sceneNumber, numbered = false, class: className = '' }: Props = $props();
</script>

<div class="sp-element sp-slugline sp-space-before-slug sp-space-after-slug relative {className}">
  {#if numbered && sceneNumber !== undefined && sceneNumber !== null && sceneNumber !== ''}
    <span
      aria-hidden="true"
      class="absolute font-bold"
      style="left: 0.5in; top: 0;"
    >{sceneNumber}</span>
  {/if}

  <span>{text}</span>

  {#if numbered && sceneNumber !== undefined && sceneNumber !== null && sceneNumber !== ''}
    <span
      aria-hidden="true"
      class="absolute font-bold"
      style="right: 0.5in; top: 0;"
    >{sceneNumber}</span>
  {/if}
</div>
