import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nxViteTsPaths()],
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
        target: 'http://localhost:3001',
        changeOrigin: false,
        secure: false,
        headers: {
          Origin: 'https://ui.schulung.multi.schule',
        },
      },
      '/SOGo': {
        target: 'https://localhost:5555/',
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: 'http://localhost:5173/',
          'X-Frame-Options': 'ALLOWALL',
          Host: 'localhost',
          'X-Forwarded-For': 'client-ip-address',
          'X-Forwarded-Proto': 'https',
          'X-Forwarded-Host': 'localhost',
        },
      },
      '/guacamole': {
        rewrite: (path) => path.replace(/^\/guacamole/, ''),
        target: 'https://ui.demo.multi.schule/guacamole',
        changeOrigin: true,
        secure: false,
        ws: true,
        headers: {
          Origin: 'https://ui.demo.multi.schule',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
      //TODO docs
    },
  },
});
