import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'path';
import { readFileSync, cpSync, mkdirSync, readdirSync, unlinkSync } from 'fs';

const port = 5173;
const host = 'localhost';

const copyFontAwesomeIcons = () => ({
  name: 'copy-fontawesome-icons',
  closeBundle() {
    const outDir = resolve(__dirname, '../../dist/apps/frontend');
    const sourceDir = resolve(__dirname, './src/assets/icons');
    const assetsDir = `${outDir}/assets`;

    mkdirSync(`${assetsDir}/fontawsome-brands`, { recursive: true });
    mkdirSync(`${assetsDir}/fontawsome-solid`, { recursive: true });

    cpSync(`${sourceDir}/fontawsome-brands`, `${assetsDir}/fontawsome-brands`, {
      recursive: true,
    });
    cpSync(`${sourceDir}/fontawsome-solid`, `${assetsDir}/fontawsome-solid`, {
      recursive: true,
    });

    const brandFiles = readdirSync(`${assetsDir}/fontawsome-brands`).map((f) => f.replace('.svg', ''));
    const solidFiles = readdirSync(`${assetsDir}/fontawsome-solid`).map((f) => f.replace('.svg', ''));
    const allIconNames = new Set([...brandFiles, ...solidFiles]);

    readdirSync(assetsDir).forEach((file) => {
      if (file.endsWith('.svg')) {
        const fileNameWithoutHash = file.replace(/-[A-Za-z0-9_-]{8}\.svg$/, '');
        if (allIconNames.has(fileNameWithoutHash)) {
          unlinkSync(`${assetsDir}/${file}`);
        }
      }
    });
  },
});

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
      copyFontAwesomeIcons(),
    ],
    build: {
      outDir: '../../dist/apps/frontend',
      emptyOutDir: true,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/@sentry/react/')) {
              return 'sentry';
            }
          },
        },
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
