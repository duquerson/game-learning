# Rainblur Theme Component Documentation

## Button Component

### API

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

### Variants

#### Primary

```tsx
<Button variant="primary">Click me</Button>
```

The primary variant features a gradient accent using the theme's accent colors.

#### Secondary

```tsx
<Button variant="secondary">Click me</Button>
```

The secondary variant has a subtle border and background.

#### Ghost

```tsx
<Button variant="ghost">Click me</Button>
```

The ghost variant is transparent with hover effects.

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Disabled State

```tsx
<Button disabled>Disabled</Button>
```

### Full Width

```tsx
<Button fullWidth>Full Width</Button>
```

## Input Component

### API

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}
```

### Default State

```tsx
<Input placeholder="Enter text" />
```

### Focus State

```tsx
<Input placeholder="Enter text" />
```

The input automatically shows focus state with the theme's accent color.

### Error State

```tsx
<Input error="This field is required" />
```

The error state shows a red border and displays the error message below the input.

### Disabled State

```tsx
<Input disabled placeholder="Disabled input" />
```

### Sizes

```tsx
<Input size="sm" placeholder="Small input" />
<Input size="md" placeholder="Medium input" />
<Input size="lg" placeholder="Large input" />
```

## Card Component

### API

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}
```

### Basic Card

```tsx
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here.</p>
</Card>
```

### Interactive Card

```tsx
<Card onClick={() => console.log('Clicked')}>
  <h3>Interactive Card</h3>
  <p>Click me!</p>
</Card>
```

### Card with Header and Footer

```tsx
<Card
  header={<h3>Card Header</h3>}
  footer={<button>Footer Action</button>}
>
  <p>Card content goes here.</p>
</Card>
```

### Hoverable Card

```tsx
<Card hoverable>
  <h3>Hoverable Card</h3>
  <p>Hover to see the glow effect.</p>
</Card>
```

## GradientText Component

### API

```typescript
interface GradientTextProps {
  children: React.ReactNode;
  gradient?: 'green' | 'teal' | 'pink' | 'purple';
  className?: string;
}
```

### Gradient Variants

#### Green

```tsx
<GradientText gradient="green">Gradient Text</GradientText>
```

#### Teal

```tsx
<GradientText gradient="teal">Gradient Text</GradientText>
```

#### Pink

```tsx
<GradientText gradient="pink">Gradient Text</GradientText>
```

#### Purple

```tsx
<GradientText gradient="purple">Gradient Text</GradientText>
```

### Combined Usage

```tsx
<h1>
  <GradientText gradient="green">Rain</GradientText>
  <span>blur</span>
</h1>
```

## Accessibility

All components implement WCAG AA compliance:

- **Focus Indicators**: Visible focus states with theme colors
- **Keyboard Navigation**: Full keyboard support for interactive elements
- **Screen Reader Support**: Proper ARIA attributes and semantic HTML
- **Color Meaning**: Alternative visual cues for color-coded information

## Best Practices

1. **Use semantic HTML**: Prefer native HTML elements when possible
2. **Provide fallbacks**: Always provide fallback content for interactive elements
3. **Test with keyboard**: Verify all interactive elements work with keyboard navigation
4. **Check contrast**: Ensure text meets WCAG AA contrast requirements
5. **Use theme tokens**: Reference CSS custom properties for consistent styling

## Examples

### Login Form

```tsx
<Card>
  <h2>Login</h2>
  <form>
    <Input 
      id="email" 
      type="email" 
      placeholder="Email" 
      required 
    />
    <Input 
      id="password" 
      type="password" 
      placeholder="Password" 
      required 
    />
    <Button variant="primary" fullWidth>
      Login
    </Button>
  </form>
</Card>
```

### Feature Card

```tsx
<Card hoverable>
  <h3>Feature Title</h3>
  <p>Feature description goes here.</p>
  <GradientText gradient="green">Learn more →</GradientText>
</Card>
```

### Action Button

```tsx
<Button variant="primary" size="lg" fullWidth>
  <GradientText gradient="green">Get Started</GradientText>
</Button>
```
