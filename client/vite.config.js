import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    // Simulated browser DOM so React components can render in Node
    environment: 'jsdom',
    // Makes describe/test/afterEach global, which Testing Library uses for auto-cleanup
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
