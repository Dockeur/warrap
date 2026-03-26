import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    proxy: {
      '/storage': {
        target: 'http://192.168.100.102:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://192.168.100.102:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
