import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/OneStep/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/hf': {
        target: 'https://router.huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hf/, ''),
      },
    },
  },
})
