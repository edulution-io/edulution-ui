import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

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
        target: 'https://auth.demo.multi.schule/auth',
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: 'https://ui.demo.multi.schule',
          'X-Forwarded-For': 'client-ip-address',
          'X-Forwarded-Proto': 'https',
          'X-Forwarded-Host': 'auth.demo.multi.schule',
        },
      },
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
      '/edu-api': {
        rewrite: (path) => path.replace(/^\/edu-api/, ''),
        target: 'http://localhost:3000/edu-api',
        changeOrigin: false,
        secure: false,
        headers: {
          Origin: 'https://ui.demo.multi.schule',
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
    emptyOutDir: true,
  },
});
