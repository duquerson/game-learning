# Rainblur Theme Design Tokens

## Overview

Design tokens are the atomic design variables that make up the Rainblur Theme. They provide a consistent and maintainable way to manage design decisions across the application.

## Color Tokens

### Background Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background-primary` | `oklch(13% 0.02 270)` | Main background |
| `--color-background-secondary` | `oklch(16% 0.02 270)` | Secondary background |
| `--color-background-surface` | `oklch(18% 0.02 270)` | Surface elements |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `oklch(100% 0 0)` | Primary text |
| `--color-text-secondary` | `oklch(75% 0 0)` | Secondary text |
| `--color-text-muted` | `oklch(60% 0 0)` | Muted text |

### Accent Colors

#### Green

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent-green` | `oklch(72% 0.19 155)` | Primary accent |
| `--color-accent-green-light` | `oklch(80% 0.18 155)` | Light variant |
| `--color-accent-green-dark` | `oklch(65% 0.20 155)` | Dark variant |

#### Teal

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent-teal` | `oklch(70% 0.15 180)` | Secondary accent |
| `--color-accent-teal-light` | `oklch(78% 0.14 180)` | Light variant |
| `--color-accent-teal-dark` | `oklch(62% 0.16 180)` | Dark variant |

#### Pink

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent-pink` | `oklch(65% 0.25 350)` | Tertiary accent |
| `--color-accent-pink-light` | `oklch(75% 0.24 350)` | Light variant |
| `--color-accent-pink-dark` | `oklch(55% 0.26 350)` | Dark variant |

#### Purple

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent-purple` | `oklch(60% 0.25 300)` | Quaternary accent |
| `--color-accent-purple-light` | `oklch(70% 0.24 300)` | Light variant |
| `--color-accent-purple-dark` | `oklch(50% 0.26 300)` | Dark variant |

## Typography Tokens

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-family-sans` | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` | Body text |
| `--font-family-mono` | `'Inter', 'Fira Code', monospace` | Code blocks |

### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `--font-size-xs` | `0.75rem` | Extra small text |
| `--font-size-sm` | `0.875rem` | Small text |
| `--font-size-base` | `1rem` | Base font size |
| `--font-size-lg` | `1.125rem` | Large text |
| `--font-size-xl` | `1.25rem` | Extra large text |
| `--font-size-2xl` | `1.5rem` | 2x large text |
| `--font-size-3xl` | `1.875rem` | 3x large text |
| `--font-size-4xl` | `2.25rem` | 4x large text |
| `--font-size-5xl` | `3rem` | 5x large text |
| `--font-size-6xl` | `3.75rem` | 6x large text |
| `--font-size-7xl` | `4.5rem` | 7x large text |
| `--font-size-8xl` | `6rem` | 8x large text |
| `--font-size-9xl` | `8rem` | 9x large text |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-light` | `300` | Light text |
| `--font-weight-normal` | `400` | Normal text |
| `--font-weight-medium` | `500` | Medium text |
| `--font-weight-semibold` | `600` | Semibold text |
| `--font-weight-bold` | `700` | Bold text |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--line-height-tight` | `1.25` | Tight line height |
| `--line-height-snug` | `1.375` | Snug line height |
| `--line-height-normal` | `1.5` | Normal line height |
| `--line-height-relaxed` | `1.625` | Relaxed line height |
| `--line-height-loose` | `2` | Loose line height |

## Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-0` | `0rem` | No spacing |
| `--spacing-1` | `0.25rem` | Extra small spacing |
| `--spacing-2` | `0.5rem` | Small spacing |
| `--spacing-3` | `0.75rem` | Small spacing |
| `--spacing-4` | `1rem` | Base spacing |
| `--spacing-5` | `1.25rem` | Medium spacing |
| `--spacing-6` | `1.5rem` | Medium spacing |
| `--spacing-8` | `2rem` | Large spacing |
| `--spacing-10` | `2.5rem` | Extra large spacing |
| `--spacing-12` | `3rem` | Extra large spacing |
| `--spacing-16` | `4rem` | Maximum spacing |

## Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Small shadow |
| `--shadow-default` | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | Default shadow |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Medium shadow |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Large shadow |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Extra large shadow |

## Animation Tokens

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | `150ms` | Fast transitions |
| `--duration-normal` | `200ms` | Normal transitions |
| `--duration-slow` | `300ms` | Slow transitions |

### Easing Curves

| Token | Value | Usage |
|-------|-------|-------|
| `--easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default easing |
| `--easing-smooth` | `cubic-bezier(0.25, 1, 0.5, 1)` | Smooth easing |

## Usage Examples

### Using Color Tokens

```css
.card {
  background-color: var(--color-background-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-accent-green);
}
```

### Using Typography Tokens

```css
.heading {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}
```

### Using Spacing Tokens

```css
.spaced-element {
  padding: var(--spacing-4);
  margin: var(--spacing-2);
}
```

### Using Shadow Tokens

```css
.card {
  box-shadow: var(--shadow-md);
}
```

### Using Animation Tokens

```css
.transition {
  transition: all var(--duration-normal) var(--easing-default);
}
```

## Customization

### Overriding Tokens

You can override any token by defining your own CSS custom property:

```css
:root {
  --color-background-primary: oklch(15% 0.02 270);
  --color-accent-green: oklch(65% 0.20 155);
}
```

### Runtime Customization

Use the theme customization utilities to adjust tokens at runtime:

```typescript
import { adjustTheme } from '../utils/theme'

adjustTheme({
  accentColor: 'teal',
  fontSize: 18,
  spacingScale: 1.2,
})
```

## Best Practices

1. **Use tokens, not values**: Always reference tokens instead of hardcoding values
2. **Maintain consistency**: Use the same token for the same design decision
3. **Test with different themes**: Verify tokens work across different theme variants
4. **Document new tokens**: Add documentation for any new tokens you create
5. **Test accessibility**: Ensure token combinations meet WCAG AA standards
