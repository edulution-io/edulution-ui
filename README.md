# Edulution UI

## Description

A UI build with Vite+React

## Getting Started

### Prerequisites

- Node.js 18

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start

   ```bash
   npm run dev
   ```

   The FE will be served on http://localhost:5173/

3. Production build

   ```bash
   npm run build
   ```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

# Docker

## Build

### Build apps, build containers and start

```bash
npm run build:all && \
docker build -t ghcr.io/edulution-io/edulution-ui -f apps/frontend/Dockerfile . && \
docker build -t ghcr.io/edulution-io/edulution-api -f apps/api/Dockerfile . && \
docker compose up -d
```
