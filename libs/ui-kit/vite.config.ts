import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

const externalDeps = [...Object.keys(pkg.peerDependencies || {}), ...Object.keys(pkg.dependencies || {})];

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
