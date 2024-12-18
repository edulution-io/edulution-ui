import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';
import { readFileSync } from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'));

  return {
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
        '/webdav': {
          target: env.VITE_LMN_URL,
          changeOrigin: true,
          secure: false,
          headers: {
            Origin: env.VITE_LMN_URL,
          },
        },
        '/api': {
          rewrite: (path) => path.replace(/^\/api/, ''),
          target: env.VITE_LMN_API_URL,
          changeOrigin: true,
          secure: false,
          headers: {
            Origin: env.VITE_LMN_URL,
          },
        },
        '/edu-api': {
          target: env.VITE_EDU_API_URL,
          changeOrigin: true,
          secure: false,
          headers: {
            Origin: env.VITE_EDU_API_URL,
          },
        },
        '/guacamole': {
          rewrite: (path) => path.replace(/^\/guacamole/, ''),
          target: `${env.VITE_GUACAMOLE_URL}/guacamole`,
          changeOrigin: true,
          secure: false,
          ws: true,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        },
      },
    },
    preview: {
      port: 4300,
      host: 'localhost',
    },
    plugins: [react(), nxViteTsPaths()],
    build: {
      outDir: '../../dist/apps/frontend',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
