import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
    export default defineConfig({
        plugins: [react()],
        resolve: {
            alias: {
                '@': '/src',
            },
        },
        server: {
            proxy: {
                '/api': {
                    target: window.location.hostname==="localhost"?'http://localhost:42069':"https://api.satc-ai.xyz",
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    })
