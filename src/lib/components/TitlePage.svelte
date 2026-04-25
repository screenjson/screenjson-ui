<script lang="ts">
  import type { ScreenJSONDocument, Lang, Author, Contributor, Source } from '../types/screenjson';
  import { getText } from '../types/screenjson';

  interface Props {
    document: ScreenJSONDocument;
    lang?: Lang;
    /** Hide the scroll hint (useful when embedders control navigation). */
    hideScrollHint?: boolean;
  }

  let { document: doc, lang = 'en' as Lang, hideScrollHint = false }: Props = $props();

  const title = $derived(doc.title ? getText(doc.title, lang) : '');
  const authors = $derived<Author[]>(doc.authors ?? []);
  const contributors = $derived<Contributor[]>((doc as unknown as { contributors?: Contributor[] }).contributors ?? []);
  const sources = $derived<Source[]>((doc as unknown as { sources?: Source[] }).sources ?? []);
  const logline = $derived(
    (doc as unknown as { logline?: Parameters<typeof getText>[0] }).logline
      ? getText((doc as unknown as { logline: Parameters<typeof getText>[0] }).logline, lang)
      : ''
  );
  const genres = $derived<string[]>((doc as unknown as { genre?: string[] }).genre ?? []);

  function personName(p: Author | Contributor): string {
    return [p.given, p.family].filter(Boolean).join(' ').trim();
  }
</script>

<section class="title-page" aria-label="Title page">
  <div class="title-inner">
    <div class="title-spacer"></div>

    <div class="title-main">
      <h1 class="title-heading">{title || 'Untitled Screenplay'}</h1>

      {#if authors.length > 0}
        <p class="title-by">by</p>
        <div class="title-authors">
          {#each authors as author (author.id)}
            <p class="title-author">{personName(author)}</p>
          {/each}
        </div>
      {/if}

      {#if logline}
        <p class="title-logline">&ldquo;{logline}&rdquo;</p>
      {/if}
    </div>

    <div class="title-spacer"></div>

    <div class="title-meta">
      {#each sources as src (src.id)}
        {@const srcTitle = src.title ? getText(src.title, lang) : ''}
        {#if srcTitle}
          <p class="title-source">
            Based on the {src.type ?? 'work'} <em>{srcTitle}</em>
          </p>
        {/if}
      {/each}

      {#if contributors.length > 0}
        <p class="title-contributors">
          with {contributors.map(personName).filter(Boolean).join(', ')}
        </p>
      {/if}

      {#if genres.length > 0}
        <p class="title-genres">{genres.join(' · ')}</p>
      {/if}
    </div>

    {#if !hideScrollHint}
      <p class="title-scroll-hint" aria-hidden="true">
        <span class="title-scroll-arrow">↓</span>
        <span>Scroll to read</span>
      </p>
    {/if}
  </div>
</section>

<style>
  .title-page {
    display: flex;
    justify-content: center;
    background: var(--color-paper);
    color: var(--color-paper-fg);
    min-height: 100vh;
    width: 100%;
  }
  .title-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    max-width: 8.5in;
    padding: 2rem clamp(1rem, 4vw, 3rem);
    text-align: center;
    font-family: var(--font-screenplay);
    color: inherit;
  }
  .title-spacer {
    flex: 1;
    min-height: 1rem;
  }
  .title-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  .title-heading {
    font-size: clamp(1.6rem, 6.5vw, 2.6rem);
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    line-height: 1.15;
    margin: 0;
  }
  .title-by {
    margin: 1.5rem 0 0.75rem;
    font-size: clamp(0.9rem, 3vw, 1.05rem);
    font-style: italic;
    opacity: 0.75;
  }
  .title-authors {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .title-author {
    margin: 0;
    font-size: clamp(1rem, 4vw, 1.2rem);
    font-weight: 500;
  }
  .title-logline {
    margin: 2rem 1rem 0;
    font-size: clamp(0.9rem, 3.2vw, 1.05rem);
    line-height: 1.55;
    font-style: italic;
    opacity: 0.8;
    max-width: 40ch;
  }
  .title-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    font-size: clamp(0.8rem, 2.8vw, 0.95rem);
    opacity: 0.75;
  }
  .title-source,
  .title-contributors,
  .title-genres {
    margin: 0;
    line-height: 1.45;
  }
  .title-source em {
    font-style: italic;
  }
  .title-genres {
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-size: 0.75rem;
    opacity: 0.55;
  }
  .title-scroll-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 2.5rem 0 0.5rem;
    font-size: 0.8rem;
    opacity: 0.45;
    font-family: var(--font-sans, system-ui, sans-serif);
  }
  .title-scroll-arrow {
    display: inline-flex;
    width: 1.2rem;
    height: 1.2rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid currentColor;
    font-size: 0.7rem;
    animation: title-scroll-pulse 2s ease-in-out infinite;
  }
  @keyframes title-scroll-pulse {
    0%, 100% { transform: translateY(0); opacity: 0.45; }
    50%      { transform: translateY(3px); opacity: 0.9; }
  }

  /* Desktop: shadowed "cover page" card. */
  @media (min-width: 1024px) {
    .title-page {
      padding: 2rem 0;
      background: transparent;
    }
    .title-inner {
      background: var(--color-paper);
      min-height: 11in;
      max-width: 8.5in;
      box-shadow:
        0 12px 36px -10px rgba(0, 0, 0, 0.38),
        0 2px 6px -2px rgba(0, 0, 0, 0.12);
      padding: 3rem 2rem;
    }
  }
</style>
