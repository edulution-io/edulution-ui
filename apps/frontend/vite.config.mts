import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const port = 5173;
const host = 'localhost';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'));

  return {
    define: {
      'process.env': {},
      APP_VERSION: JSON.stringify(pkg.version),
      VITE_ENV: JSON.stringify(mode),
    },
    test: {
      globals: true,
      watch: false,
      environment: 'jsdom',
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '../../libs/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '../../libs/ui-kit/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
      setupFiles: ['./test/vitest.setup.ts'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../coverage/apps/frontend',
        provider: 'v8',
        reporter: ['text', 'json-summary', 'lcov'],
      },
    },
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/frontend',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@libs': resolve(__dirname, '../../libs/src'),
        '@edulution-io/ui-kit/styles': resolve(__dirname, '../../libs/ui-kit/src/styles'),
        '@edulution-io/ui-kit': resolve(__dirname, '../../libs/ui-kit/src/index.ts'),
      },
      dedupe: ['@tldraw/store', '@tldraw/validate', '@tldraw/tlschema'],
    },
    server:
      mode === 'development'
        ? {
            allowedHosts: ['host.docker.internal'],
            port,
            host,
            fs: { strict: false },
            proxy: {
              '/auth': {
                target: env.VITE_KEYCLOAK_URL,
                changeOrigin: true,
                secure: true,
                headers: {
                  Origin: env.VITE_KEYCLOAK_URL,
                },
              },
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
                ws: true,
                secure: false,
                headers: {
                  Origin: env.VITE_EDU_API_URL,
                },
              },
              '/docservice': {
                target: env.VITE_ONLYOFFICE_URL,
                changeOrigin: true,
                ws: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/docservice/, ''),
                headers: {
                  'X-Forwarded-Proto': 'http',
                  'X-Forwarded-Host': `${host}:${port}`,
                  'X-Forwarded-Prefix': '/docservice',
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
          }
        : undefined,
    preview: {
      port: 4300,
      host,
    },
    plugins: [
      svgr({
        svgrOptions: {
          exportType: 'default',
        },
      }),
      react(),
      nxViteTsPaths(),
    ],
    css: {
      lightningcss: {
        errorRecovery: true,
      },
    },
    build: {
      outDir: '../../dist/apps/frontend',
      emptyOutDir: true,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('@sentry/react')) {
              return 'sentry';
            }
            return undefined;
          },
        },
      },
    },
  };
});
