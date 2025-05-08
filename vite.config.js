import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: true
  },
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        play: './play.html'
      }
    }
  }
});