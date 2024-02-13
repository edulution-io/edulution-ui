import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/webdav': {
                target: 'https://server.demo.multi.schule',
                changeOrigin: true,
                secure: false,
                headers: {
                    "Origin": "https://server.demo.multi.schule"
                },
            },
            '/api': {
                rewrite: path => path.replace(/^\/api/, ''),
                target: 'https://server.demo.multi.schule:8001',
                changeOrigin: true,
                secure: false,
                headers: {
                    "Origin": "https://server.demo.multi.schule:8001"
                },
            },

            //TODO docs
        }

    }
});
