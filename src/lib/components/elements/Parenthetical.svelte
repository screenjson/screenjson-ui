<script lang="ts">
  import { MARGINS } from '../../constants/formatting';
  
  interface Props {
    text: string;
    class?: string;
  }
  
  let { text, class: className = '' }: Props = $props();
  
  // Ensure parenthetical is wrapped in parentheses
  const displayText = $derived.by(() => {
    const trimmed = text.trim();
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      return trimmed;
    }
    return `(${trimmed})`;
  });
</script>

<div
  class="screenplay-element screenplay-parenthetical {className}"
  style="
    margin-left: {MARGINS.parenthetical.left}in;
    margin-right: {MARGINS.parenthetical.right}in;
  "
>
  {displayText}
</div>

<style>
  .screenplay-parenthetical {
    font-family: var(--font-screenplay);
    font-size: 12pt;
    line-height: 1;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
