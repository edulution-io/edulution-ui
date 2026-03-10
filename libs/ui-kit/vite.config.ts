import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { readFileSync, mkdirSync, copyFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

const externalDeps = [...Object.keys(pkg.peerDependencies || {}), ...Object.keys(pkg.dependencies || {})];

const copyThemeCss = () => ({
  name: 'copy-theme-css',
  closeBundle() {
    const distStyles = resolve(__dirname, 'dist/styles');
    mkdirSync(distStyles, { recursive: true });
    copyFileSync(resolve(__dirname, 'src/styles/theme.css'), resolve(distStyles, 'theme.css'));
  },
});

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      outDir: 'dist',
      rollupTypes: false,
      tsconfigPath: './tsconfig.json',
      entryRoot: 'src',
    }),
    copyThemeCss(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EduUiKit',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: (id) => {
        return externalDeps.some((dep) => id === dep || id.startsWith(`${dep}/`));
      },
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        preserveModules: false,
        exports: 'named',
      },
    },
    sourcemap: true,
    minify: false,
    cssCodeSplit: false,
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
});
