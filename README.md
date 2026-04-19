# ScreenJSON-UI

An embeddable document viewer for ScreenJSON screenplay files. Displays JSON-formatted screenplays as beautiful, PDF-style documents in the browser.

## Features

- **PDF-style rendering** - Displays screenplays with proper Hollywood formatting (Warner Bros/Final Draft standard)
- **Dark/Light themes** - Built-in theme support with persistence
- **Multi-language** - Support for screenplays with multiple language translations
- **Virtual scrolling** - Efficient rendering for large documents (300+ pages)
- **Responsive** - Works on mobile, tablet, and desktop (400px to 1200px+ viewports)
- **Encryption support** - View encrypted screenplay content with password
- **Bookmarks & Notes** - User annotations stored in localStorage
- **Metadata panel** - View character lists, scene index, SFX/VFX/props breakdowns
- **CDN-ready** - Embeddable via script tag with no build required

## Installation

### NPM

```bash
npm install screenjson-ui
```

### CDN

```html
<script src="https://cdn.screenjson.com/ui/screenjson-ui.js"></script>
```

## Usage

### JavaScript API

```javascript
import ScreenJSONUI from 'screenjson-ui';

const viewer = new ScreenJSONUI({
  element: 'viewer', // Element ID or HTMLElement
  src: 'https://example.com/screenplay.json',
  theme: 'dark',
  virtual: true,
  onLoad: (doc) => console.log('Loaded:', doc.title),
  onPageChange: (page) => console.log('Page:', page)
});
```

### Data Attributes

```html
<script 
  src="https://cdn.screenjson.com/ui/screenjson-ui.js"
  data-src="screenplay.json"
  data-theme="dark"
  data-width="900"
  data-height="600">
</script>
```

### Query Parameters

```
viewer.html?src=https://example.com/screenplay.json&theme=dark
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `element` | `string \| HTMLElement` | required | Target container |
| `src` | `string` | - | URL to load ScreenJSON from |
| `document` | `ScreenJSONDocument` | - | Pre-loaded document object |
| `theme` | `'light' \| 'dark'` | `'light'` | Initial theme |
| `zoom` | `number` | `1` | Initial zoom (0.5 - 2) |
| `lang` | `string` | Document default | Language for multi-language docs |
| `page` | `number` | `1` | Initial page number |
| `numbered` | `boolean` | `false` | Show scene numbers in margins |
| `paginated` | `boolean` | `true` | Show page numbers |
| `corner` | `string` | `'top-right'` | Menu button position |
| `virtual` | `boolean` | `false` | Use virtual scrolling |
| `password` | `string` | - | Password for encrypted content |
| `onLoad` | `function` | - | Called when document loads |
| `onPageChange` | `function` | - | Called on page change |
| `onError` | `function` | - | Called on error |

## Svelte Component Usage

```svelte
<script>
  import { ScreenJSONViewer } from 'screenjson-ui';
  import type { ScreenJSONDocument } from 'screenjson-ui';
  
  let document: ScreenJSONDocument = /* ... */;
</script>

<ScreenJSONViewer 
  {document}
  theme="light"
  numbered={true}
/>
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library for CDN
npm run build:lib

# Type check
npm run check
```

## Screenplay Formatting

The viewer follows Warner Bros/Final Draft formatting standards:

- **Paper size**: US Letter (8.5" x 11")
- **Font**: Courier Prime, 12pt
- **Lines per page**: 60 maximum
- **Margins**:
  - Action: 1.7" left, 1.1" right
  - Dialogue: 2.7" left, 2.4" right
  - Character: 4.1" left
  - Parenthetical: 3.4" left, 3.1" right
  - Transition: 6.0" left

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## License

MIT
