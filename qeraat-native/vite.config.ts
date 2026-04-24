import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Required for sql.js WebAssembly
  optimizeDeps: {
    exclude: ['sql.js'],
  },
  // Capacitor serves from root
  base: './',
  build: {
    outDir: 'dist',
  },
})
