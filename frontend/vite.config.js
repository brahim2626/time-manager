import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',      // ← important pour Docker
    proxy: {
      '/api': {
        target: 'http://backend:4000',  // ← nom du service Docker
        changeOrigin: true
      }
    }
  }
})