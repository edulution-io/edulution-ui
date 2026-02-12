# @edulution-io/ui-kit

Edulution UI component library built with React, TypeScript, Tailwind CSS, and shadcn/ui patterns.

## Installation

```bash
npm install @edulution-io/ui-kit
```

## Requirements

- React >= 18.0.0
- ReactDOM >= 18.0.0
- Tailwind CSS (for styling)

## Usage

```tsx
import { Button } from '@edulution-io/ui-kit';

function App() {
  return (
    <Button
      variant="default"
      size="lg"
    >
      Click me
    </Button>
  );
}
```

## Tailwind CSS Setup

This library uses Tailwind CSS classes. You need to configure your Tailwind to scan the library's components:

```js
// tailwind.config.js
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@edulution-io/ui-kit/dist/**/*.{js,cjs}',
    './node_modules/@edulution-io/ui-kit/src/**/*.{ts,tsx}',
  ],
  // Extend with ui-kit's theme config (optional)
  presets: [require('@edulution-io/ui-kit/tailwind.config')],
};
```

## CSS Variables

The library uses CSS variables for theming. Define these in your global CSS:

```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --primary: #0a0a0a;
  --primary-foreground: #fafafa;
  --secondary: #f4f4f5;
  --secondary-foreground: #0a0a0a;
  --destructive: #ef4444;
  --destructive-foreground: #fafafa;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --accent: #f4f4f5;
  --accent-foreground: #0a0a0a;
  --border: #e4e4e7;
  --input: #e4e4e7;
  --ring: #0a0a0a;
  --radius: 0.5rem;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  /* ... define dark mode variables */
}
```

## License

AGPL-3.0-or-later
