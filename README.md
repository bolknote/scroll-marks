# ScrollMarks

A lightweight JavaScript library to colorize the scrollbar based on element positions. Create visual markers on the scrollbar that correspond to specific sections of your page.

![Demo](https://img.shields.io/badge/demo-live-brightgreen)
![Size](https://img.shields.io/badge/size-~3kb-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🎨 **Color markers** — Highlight sections on the scrollbar with custom colors
- 📐 **Auto-positioning** — Automatically calculates element positions and heights
- 🔄 **Reactive updates** — Responds to window resize and DOM changes
- 🪶 **Lightweight** — No dependencies, ~3kb minified
- 📦 **Multiple formats** — UMD, ESM, CommonJS support
- 🔒 **Isolated** — Minimal global scope pollution

## Installation

### Via npm

```bash
npm install @bolknote/scroll-marks
```

### Via CDN

[unpkg](https://unpkg.com) automatically serves any package published to npm:

```html
<!-- Latest version -->
<script src="https://unpkg.com/@bolknote/scroll-marks"></script>

<!-- Specific version (recommended for production) -->
<script src="https://unpkg.com/@bolknote/scroll-marks@1.0.0/dist/scroll-marks.min.js"></script>

<!-- ES Module -->
<script type="module">
  import { ScrollMarks } from 'https://unpkg.com/@bolknote/scroll-marks/dist/scroll-marks.esm.js';
</script>
```

Alternative CDNs:
```html
<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@bolknote/scroll-marks/dist/scroll-marks.min.js"></script>
```

### Manual download

Download `scroll-marks.js` and include it in your project:

```html
<script src="scroll-marks.js"></script>
```

## Quick Start

### 1. Add the script

```html
<script src="scroll-marks.js"></script>
```

### 2. Mark your elements

Add `data-scroll-color` attribute to elements you want to highlight:

```html
<section data-scroll-color="#ff6b6b">
  <h2>Red Section</h2>
  <p>This section will be marked red on the scrollbar.</p>
</section>

<section data-scroll-color="#48dbfb">
  <h2>Cyan Section</h2>
  <p>This section will be marked cyan on the scrollbar.</p>
</section>
```

### 3. Initialize

```html
<script>
  const scrollMarks = new ScrollMarks();
</script>
```

That's it! The scrollbar will now show colored markers corresponding to your sections.

## Usage

### ES Modules

```javascript
import { ScrollMarks } from './scroll-marks.esm.js';

const scrollMarks = new ScrollMarks({
  trackColor: '#1a1a2e',
  thumbColor: 'rgba(255, 255, 255, 0.3)'
});
```

### CommonJS

```javascript
const ScrollMarks = require('@bolknote/scroll-marks');

const scrollMarks = new ScrollMarks();
```

### Browser Global

```html
<script src="scroll-marks.js"></script>
<script>
  const scrollMarks = new ScrollMarks();
</script>
```

## Configuration

```javascript
const scrollMarks = new ScrollMarks({
  // Base color of the scrollbar track
  trackColor: '#1a1a2e',
  
  // Scrollbar thumb color
  thumbColor: 'rgba(255, 255, 255, 0.3)',
  
  // CSS selector for marked elements
  selector: '[data-scroll-color]',
  
  // Data attribute name containing the color
  attributeName: 'data-scroll-color',
  
  // Scrollbar width in pixels
  scrollbarWidth: 14,
  
  // Debounce delay for updates (ms)
  debounceMs: 16
});
```

## API

### `new ScrollMarks(options?)`

Creates a new ScrollMarks instance.

### `scrollMarks.update()`

Force update the scrollbar. Useful after programmatic DOM changes.

```javascript
scrollMarks.update();
```

### `scrollMarks.getMarks()`

Returns an array of current color marks with their positions.

```javascript
const marks = scrollMarks.getMarks();
// [{ start: 15.5, end: 28.3, color: '#ff6b6b' }, ...]
```

### `scrollMarks.getId()`

Returns the unique instance ID.

```javascript
const id = scrollMarks.getId();
// 'scrollmarks-abc123xyz'
```

### `scrollMarks.destroy()`

Destroys the instance, removes styles, and cleans up observers.

```javascript
scrollMarks.destroy();
```

### `ScrollMarks.VERSION`

Static property containing the library version.

```javascript
console.log(ScrollMarks.VERSION); // '1.0.0'
```

### `ScrollMarks.autoInit()`

Auto-initialize if body has `data-scrollmarks-auto` attribute.

```html
<body data-scrollmarks-auto 
      data-scrollmarks-track="#1a1a2e" 
      data-scrollmarks-thumb="rgba(255,255,255,0.3)">
```

## Supported Colors

Any valid CSS color value:

```html
<div data-scroll-color="#ff6b6b">Hex</div>
<div data-scroll-color="rgb(255, 107, 107)">RGB</div>
<div data-scroll-color="rgba(255, 107, 107, 0.8)">RGBA</div>
<div data-scroll-color="hsl(0, 100%, 71%)">HSL</div>
<div data-scroll-color="coral">Named color</div>
```

## Dynamic Elements

ScrollMarks automatically detects new elements added to the DOM:

```javascript
const section = document.createElement('div');
section.setAttribute('data-scroll-color', '#9b59b6');
section.innerHTML = '<h2>New Section</h2>';
document.body.appendChild(section);
// Scrollbar updates automatically!
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 10.1+
- Edge 79+

**Note:** Firefox uses standard scrollbar styling which has limited gradient support. The library falls back to solid colors in Firefox.

**Note:** Mobile browsers hide scrollbars by default and don't support custom scrollbar styling. This library is designed for desktop browsers.

## TypeScript

TypeScript definitions are included:

```typescript
import { ScrollMarks, ScrollMarksOptions, ColorMark } from '@bolknote/scroll-marks';

const options: ScrollMarksOptions = {
  trackColor: '#1a1a2e',
  scrollbarWidth: 16
};

const scrollMarks = new ScrollMarks(options);
const marks: ColorMark[] = scrollMarks.getMarks();
```

## License

MIT © 2025 Evgeny Stepanischev

