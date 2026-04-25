# Rainblur Theme Setup Guide

## Installation

### Prerequisites

- Node.js 18+ 
- pnpm 9.0.0+
- Astro 6.1.6+

### Install Dependencies

```bash
pnpm install
```

### Add Theme to Your Project

1. Import the main theme CSS in your `src/styles/global.css`:

```css
@import './theme.css';
```

2. Configure Tailwind CSS in `src/tailwind/config.js`:

```javascript
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(13% 0.02 270)',
        foreground: 'oklch(100% 0 0)',
        // ... other theme colors
      },
    },
  },
  plugins: [],
}
```

3. Import Inter font in your `src/styles/typography.css`:

```css
@import '@fontsource-variable/inter/index.css';
```

## Configuration

### Theme Variables

The Rainblur Theme uses CSS custom properties for easy customization:

```css
:root {
  /* Background colors */
  --color-background-primary: oklch(13% 0.02 270);
  --color-background-secondary: oklch(16% 0.02 270);
  --color-background-surface: oklch(18% 0.02 270);
  
  /* Text colors */
  --color-text-primary: oklch(100% 0 0);
  --color-text-secondary: oklch(75% 0 0);
  --color-text-muted: oklch(60% 0 0);
  
  /* Accent colors */
  --color-accent-green: oklch(72% 0.19 155);
  --color-accent-teal: oklch(70% 0.15 180);
  --color-accent-pink: oklch(65% 0.25 350);
  --color-accent-purple: oklch(60% 0.25 300);
}
```

### Customizing Theme Values

You can override theme values by defining your own CSS custom properties:

```css
:root {
  --color-background-primary: oklch(15% 0.02 270);
  --color-accent-green: oklch(65% 0.20 155);
}
```

## Usage

### Typography

```html
<h1 class="font-bold text-4xl">Heading</h1>
<p class="font-normal text-base">Body text</p>
```

### Colors

```html
<div class="bg-background-primary text-foreground">
  Content
</div>
```

### Spacing

```html
<div class="p-4 m-2">
  Spaced content
</div>
```

### Shadows

```html
<div class="shadow-md">
  Card with shadow
</div>
```

### Animations

```html
<div class="animate-fade-in">
  Animated content
</div>
```

## Accessibility

The Rainblur Theme includes WCAG AA compliant accessibility features:

- Focus indicators with sufficient contrast
- Keyboard navigation support
- Screen reader compatible markup
- Color meaning alternatives

## Performance

The theme includes performance optimizations:

- Font-display swap for fast text rendering
- GPU-accelerated animations
- Reduced motion support
- Optimized CSS with tree shaking

## Troubleshooting

### Font Loading Issues

If fonts fail to load, the system will fall back to system sans-serif fonts. Check your network connection and ensure Fontsource is properly installed.

### Theme Not Applying

Ensure you've imported the theme CSS in your `global.css` and configured Tailwind correctly.

### Accessibility Issues

Use the built-in accessibility utilities:

```html
<div class="sr-only">Screen reader only content</div>
<div class="focus-visible-ring">Visible focus indicator</div>
```

## Support

For issues and questions, please refer to the main documentation or open an issue in the repository.
