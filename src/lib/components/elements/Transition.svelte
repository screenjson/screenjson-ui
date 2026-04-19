<script lang="ts">
  interface Props {
    text: string;
    class?: string;
  }
  let { text, class: className = '' }: Props = $props();
</script>

<p class="sp-element sp-transition sp-space-before-transition {className}">{text}</p>
