<script lang="ts">
  interface Props {
    text: string;
    class?: string;
  }
  let { text, class: className = '' }: Props = $props();
</script>

<p class="sp-element sp-dialogue {className}">{text}</p>
