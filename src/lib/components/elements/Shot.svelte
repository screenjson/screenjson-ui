<script lang="ts">
  import { MARGINS, SPACING } from '../../constants/formatting';
  
  interface Props {
    text: string;
    class?: string;
  }
  
  let { text, class: className = '' }: Props = $props();
</script>

<div
  class="screenplay-element screenplay-shot {className}"
  style="
    margin-left: {MARGINS.action.left}in;
    margin-right: {MARGINS.action.right}in;
    margin-top: {SPACING.beforeSlugline * (1/6)}in;
    margin-bottom: {SPACING.afterSlugline * (1/6)}in;
  "
>
  {text}
</div>

<style>
  .screenplay-shot {
    font-family: var(--font-screenplay);
    font-size: 12pt;
    line-height: 1;
    text-transform: uppercase;
    font-weight: bold;
  }
</style>
