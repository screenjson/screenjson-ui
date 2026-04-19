<script lang="ts">
  import { MARGINS, SPACING } from '../../constants/formatting';
  
  interface Props {
    text: string;
    sceneNumber?: number;
    numbered?: boolean;
    class?: string;
  }
  
  let { 
    text, 
    sceneNumber, 
    numbered = false,
    class: className = '' 
  }: Props = $props();
</script>

<div
  class="screenplay-element screenplay-slugline {className}"
  style="
    margin-left: {MARGINS.action.left}in;
    margin-right: {MARGINS.action.right}in;
    margin-top: {SPACING.beforeSlugline * (1/6)}in;
    margin-bottom: {SPACING.afterSlugline * (1/6)}in;
  "
>
  {#if numbered && sceneNumber}
    <span 
      class="scene-number scene-number-left"
      style="left: {MARGINS.sceneNumber.left}in;"
    >
      {sceneNumber}
    </span>
  {/if}
  
  <span class="slugline-text">{text}</span>
  
  {#if numbered && sceneNumber}
    <span 
      class="scene-number scene-number-right"
      style="left: {MARGINS.sceneNumber.right}in;"
    >
      {sceneNumber}
    </span>
  {/if}
</div>

<style>
  .screenplay-slugline {
    font-family: var(--font-screenplay);
    font-size: 12pt;
    line-height: 1;
    font-weight: bold;
    text-transform: uppercase;
    position: relative;
  }
  
  .slugline-text {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  
  .scene-number {
    position: absolute;
    font-weight: bold;
  }
  
  .scene-number-left {
    text-align: right;
    transform: translateX(-100%);
    padding-right: 0.5em;
  }
  
  .scene-number-right {
    text-align: left;
    padding-left: 0.5em;
  }
</style>
