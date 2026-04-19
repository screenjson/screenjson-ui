<script lang="ts">
  interface Props {
    text: string;
    class?: string;
  }
  let { text, class: className = '' }: Props = $props();
</script>

<p class="sp-element sp-action sp-space-paragraph {className}">{text}</p>
