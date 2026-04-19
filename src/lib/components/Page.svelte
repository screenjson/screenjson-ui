<script lang="ts">
  import type { Page as PageType } from '../services/paginator';
  import { ElementRenderer } from './elements';

  interface Props {
    page: PageType;
    numbered?: boolean;
    paginated?: boolean;
  }

  let { page, numbered = false, paginated = true }: Props = $props();
</script>

<article
  class="paper-page mx-auto mb-6 last:mb-0"
  aria-label={`Page ${page.number}`}
>
  <!-- Header row -->
  <header
    class="flex justify-between items-start px-[1.5in] pb-[0.25in] min-h-[0.5in]"
  >
    {#if page.hasContinuedHeader}
      <span class="font-bold uppercase tracking-wide">CONTINUED:</span>
    {:else}
      <span>&nbsp;</span>
    {/if}

    {#if paginated && page.number > 1}
      <span class="font-bold">{page.number}.</span>
    {/if}
  </header>

  <!-- Body -->
  <div class="px-0">
    {#each page.elements as element (element.element.id + ':' + (element.isContinued ? 'c' : 'o'))}
      <ElementRenderer {element} {numbered} />
    {/each}
  </div>

  <!-- Footer row -->
  {#if page.hasContinuedFooter}
    <footer class="flex justify-end px-[1.5in] pt-[0.25in]">
      <span class="uppercase">(CONTINUED)</span>
    </footer>
  {/if}
</article>
