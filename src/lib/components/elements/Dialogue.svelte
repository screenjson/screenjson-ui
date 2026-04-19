<script lang="ts">
  import { MARGINS } from '../../constants/formatting';
  
  interface Props {
    text: string;
    class?: string;
  }
  
  let { text, class: className = '' }: Props = $props();
</script>

<div
  class="screenplay-element screenplay-dialogue {className}"
  style="
    margin-left: {MARGINS.dialogue.left}in;
    margin-right: {MARGINS.dialogue.right}in;
  "
>
  {text}
</div>

<style>
  .screenplay-dialogue {
    font-family: var(--font-screenplay);
    font-size: 12pt;
    line-height: 1;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
