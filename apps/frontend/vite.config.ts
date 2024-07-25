import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'));

export default defineConfig({
  // Exception needed for excalidraw
  define: {
    'process.env': {},
    APP_VERSION: JSON.stringify(pkg.version),
  },
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['./test/vitest.setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/frontend',
      provider: 'v8',
    },
  },
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@libs': resolve(__dirname, '../../libs/src'),
    },
  },
  server: {
    port: 5173,
    host: 'localhost',
    fs: { strict: false },
    proxy: {
      '/auth': {
        rewrite: (path) => path.replace(/^\/auth/, ''),
        target: 'https://auth.schulung.multi.schule/auth',
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: 'https://ui.schulung.multi.schule',
          'X-Forwarded-For': 'client-ip-address',
          'X-Forwarded-Proto': 'https',
          'X-Forwarded-Host': 'auth.schulung.multi.schule',
        },
      },
      '/webdav': {
        target: 'https://server.schulung.multi.schule',
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: 'https://server.schulung.multi.schule',
        },
      },
      '/api': {
        rewrite: (path) => path.replace(/^\/api/, ''),
        target: 'https://server.schulung.multi.schule:8001',
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: 'https://server.schulung.multi.schule:8001',
        },
      },
      '/edu-api': {
        rewrite: (path) => path.replace(/^\/edu-api/, ''),
        target: 'http://localhost:3001/edu-api',
        changeOrigin: false,
        secure: false,
        headers: {
          Origin: 'https://ui.schulung.multi.schule',
        },
      },
      '/guacamole': {
        rewrite: (path) => path.replace(/^\/guacamole/, ''),
        target: 'http://localhost:8081/guacamole',
        changeOrigin: true,
        secure: false,
        ws: true,
        headers: {
          Origin: 'https://ui.schulung.multi.schule',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
      //TODO docs
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  build: {
    outDir: '../../dist/apps/frontend',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
