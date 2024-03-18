import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { createRequire } from 'node:module';
import { defineConfig, normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

const require = createRequire(import.meta.url);
const cMapsDir = normalizePath(path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps'));
const standardFontsDir = normalizePath(
  path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts'),
);

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: cMapsDir, dest: '.' }, // Adjusted destination to the root of the output folder
        { src: standardFontsDir, dest: '.' },
      ],
    }),
  ],
  plugins: [react(), nxViteTsPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/frontend/src'),
    },
  },
  server: {
    proxy: {
      '/webdav': {
        target: 'https://server.demo.multi.schule',
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: 'https://server.demo.multi.schule',
        },
      },
      '/api': {
        rewrite: (path) => path.replace(/^\/api/, ''),
        target: 'https://server.demo.multi.schule:8001',
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: 'https://server.demo.multi.schule:8001',
        },
      },

      //TODO docs
    },
  },
});
