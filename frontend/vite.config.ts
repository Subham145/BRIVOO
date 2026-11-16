import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = process.env.VITE_BACKEND_URL || 'http://127.0.0.1:5005';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('@react-oauth/google')) {
              return 'vendor-google-auth';
            }
            return 'vendor-common';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  server: {
    host: true, // Listen on all local IPs (Windows, macOS, Linux, Docker, mobile testing)
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false
      },
      '/images': {
        target: backendTarget,
        changeOrigin: true,
        secure: false
      }
    }
  }
});
