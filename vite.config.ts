import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nxViteTsPaths(),
    nodePolyfills({
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true, // can also be 'build', 'dev', or false
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/frontend/src'),
    },
  },
  server: {
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
        target: 'http://localhost:3000/edu-api',
        changeOrigin: false,
        secure: false,
        headers: {
          Origin: 'https://ui.schulung.multi.schule',
        },
      },
      //TODO docs
    },
  },
});
