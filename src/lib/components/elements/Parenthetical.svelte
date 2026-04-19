<script lang="ts">
  interface Props {
    text: string;
    class?: string;
  }
  let { text, class: className = '' }: Props = $props();
  const clean = $derived.by(() => {
    const t = (text ?? '').trim();
    if (!t) return '';
    const withParens = t.startsWith('(') ? t : '(' + t;
    return withParens.endsWith(')') ? withParens : withParens + ')';
  });
</script>

<p class="sp-element sp-parenthetical {className}">{clean}</p>
