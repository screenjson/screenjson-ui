<script lang="ts">
  import { MARGINS, SPACING } from '../../constants/formatting';
  
  interface Props {
    text: string;
    class?: string;
  }
  
  let { text, class: className = '' }: Props = $props();
</script>

<div
  class="screenplay-element screenplay-transition {className}"
  style="
    margin-left: {MARGINS.transition.left}in;
    margin-top: {SPACING.beforeTransition * (1/6)}in;
    margin-bottom: {SPACING.afterTransition * (1/6)}in;
  "
>
  {text}
</div>

<style>
  .screenplay-transition {
    font-family: var(--font-screenplay);
    font-size: 12pt;
    line-height: 1;
    text-transform: uppercase;
    text-align: right;
  }
</style>
