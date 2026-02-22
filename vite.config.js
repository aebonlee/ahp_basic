import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ahp_basic/',
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
