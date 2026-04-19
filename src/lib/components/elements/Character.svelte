<script lang="ts">
  interface Props {
    name: string;
    display?: string;
    class?: string;
  }
  let { name, display, class: className = '' }: Props = $props();
</script>

<p class="sp-element sp-character sp-space-before-char {className}">
  {display || name}
</p>
