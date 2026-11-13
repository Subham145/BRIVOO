import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = process.env.VITE_BACKEND_URL || 'http://127.0.0.1:5005';

export default defineConfig({
  plugins: [react()],
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
