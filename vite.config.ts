import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react(),],
    server: {
        cors: true,
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')                
            },
        },
    },
    base: '/',
});
