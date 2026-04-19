# screenjson-ui

An embeddable, framework-agnostic JavaScript viewer for [ScreenJSON](https://screenjson.com)
documents. Renders screenplays as Final Draft / WriterDuet-style print pages
in the browser, with light + dark themes, multi-language support, and
in-browser AES-256 decryption.

```bash
npm install screenjson-ui
```

```html
<script src="https://cdn.screenjson.com/ui/screenjson-ui.js" type="module"></script>
<link  rel="stylesheet" href="https://cdn.screenjson.com/ui/screenjson-ui.css" />
```

## Features

- Print-screenplay layout — US Letter, Courier Prime 12pt, industry margins.
- Light + dark themes, with system-preference detection and `localStorage` persistence.
- Multi-language documents — switch render language at runtime.
- Auto-fit zoom — paper shrinks to viewport on narrow screens; manual zoom on top.
- Built-in toolbar with theme, zoom, language, info, print, and download.
- Tailwind v4 + native CSS variables — easy to re-theme.
- Zero framework dependency in the embed API; native Svelte component for SvelteKit users.

## Quick start

### npm

```ts
import ScreenJSONUI from 'screenjson-ui';
import 'screenjson-ui/style.css';

const viewer = new ScreenJSONUI({
  element: 'viewer',           // an id or HTMLElement
  src:     '/screenplay.json', // URL — or use `document` for a pre-loaded object
  theme:   'dark'              // 'light' | 'dark', defaults to system preference
});
```

### CDN — single script tag

```html
<div id="viewer" style="height: 100vh;"></div>

<link  rel="stylesheet" href="https://cdn.screenjson.com/ui/screenjson-ui.css" />
<script type="module">
  import ScreenJSONUI from 'https://cdn.screenjson.com/ui/screenjson-ui.js';

  new ScreenJSONUI({ element: 'viewer', src: '/screenplay.json' });
</script>
```

### CDN — data attributes (no JS needed)

```html
<div id="viewer" style="height: 100vh;"></div>

<link  rel="stylesheet" href="https://cdn.screenjson.com/ui/screenjson-ui.css" />
<script
  src="https://cdn.screenjson.com/ui/screenjson-ui.js"
  data-src="/screenplay.json"
  data-theme="dark">
</script>
```

### Svelte / SvelteKit

```svelte
<script lang="ts">
  import { ScreenJSONViewer } from 'screenjson-ui';
  import 'screenjson-ui/style.css';
  import type { ScreenJSONDocument } from 'screenjson-ui';

  export let document: ScreenJSONDocument;
</script>

<ScreenJSONViewer {document} theme="light" />
```

## Configuration

All configuration goes through `ScreenJSONUIConfig`:

| Option | Type | Default | Description |
|---|---|---|---|
| `element` | `string \| HTMLElement` | **required** | Mount target. String is treated as an element id. |
| `src` | `string` | — | URL of a ScreenJSON document. |
| `document` | `ScreenJSONDocument` | — | Pre-loaded document — overrides `src`. |
| `theme` | `'light' \| 'dark'` | system preference | Initial theme. |
| `zoom` | `number` | `1` | Manual zoom multiplier on top of auto-fit. 0.5 – 2. |
| `lang` | `string` | document `lang` | BCP 47 tag — chooses which language to render. |
| `numbered` | `boolean` | `false` | Show scene numbers in the margin. |
| `paginated` | `boolean` | `true` | Show page numbers. |
| `password` | `string` | — | Password for AES-256 encrypted documents. |
| `onLoad` | `(doc) => void` | — | Called once after the document loads. |
| `onPageChange` | `(page) => void` | — | Called on every page change. |
| `onError` | `(err) => void` | — | Called on fetch / parse / decrypt errors. |

## Development

```bash
git clone https://github.com/screenjson/screenjson-ui.git
cd screenjson-ui
npm install
npm run dev          # SvelteKit dev server on http://127.0.0.1:5173
npm run build:lib    # produce dist/screenjson-ui.{js,umd.js,css} for CDN/npm
```

The standalone dev server at `/` includes a sidebar with bundled example
screenplays, a file uploader, and a URL loader for any remote ScreenJSON
document.

## Browser support

Chrome 90+, Firefox 90+, Safari 14+, Edge 90+. Uses CSS `zoom` for paper
scaling — works in all four. Print uses the standard `@page { size: letter; }`.

## License

[MIT](./LICENSE) — © AC DEV SERVICES, LLC.

The ScreenJSON schema is also open: see the [specification](https://screenjson.com/specification/).
