import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Frontend port configuration - change this value to use a different port
const FRONTEND_PORT = 6000

export default defineConfig({
  plugins: [react()],
  envDir: '../', // Look for .env files in the parent directory
  server: {
    port: FRONTEND_PORT,
    proxy: {
      // Proxy API requests to the backend
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/problems': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/drafts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/tasks': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/healthz': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/readyz': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})