import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development, /api requests are proxied to the Express backend.
// host: true lets phones on the same Wi-Fi open the app (needed to test QR scanning).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true, proxy: { '/api': 'http://localhost:5000' } },
});
