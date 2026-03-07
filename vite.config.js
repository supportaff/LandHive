import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  build: {
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove all console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'clerk': ['@clerk/clerk-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  
  server: {
    port: 5173,
  },
})
