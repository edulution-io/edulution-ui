import react from '@vitejs/plugin-react-swc';
import path from 'path';
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
        target: 'https://server.demo.multi.schule:8001',
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: 'https://server.demo.multi.schule:8001',
        },
      },
      '/api/webdav/list': {
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
