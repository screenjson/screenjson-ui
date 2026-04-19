<script lang="ts">
  import { MARGINS, SPACING } from '../../constants/formatting';
  
  interface Props {
    name: string;
    extension?: string;
    class?: string;
  }
  
  let { 
    name, 
    extension,
    class: className = '' 
  }: Props = $props();
  
  const displayName = $derived(
    extension ? `${name} ${extension}` : name
  );
</script>

<div
  class="screenplay-element screenplay-character {className}"
  style="
    margin-left: {MARGINS.character.left}in;
    margin-top: {SPACING.beforeCharacter * (1/6)}in;
  "
>
  {displayName}
</div>

<style>
  .screenplay-character {
    font-family: var(--font-screenplay);
    font-size: 12pt;
    line-height: 1;
    text-transform: uppercase;
  }
</style>
