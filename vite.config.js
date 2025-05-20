import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: 'theme/src',
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    cors: true,
    hmr: {
      host: 'localhost'
    },
    watch: {
      usePolling: false,
      interval: 1000
    }
  },
  build: {
    outDir: resolve(__dirname, 'theme/dist'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'theme/src/js/main.js'),
        style: resolve(__dirname, 'theme/src/scss/style.scss')
      }
    }
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: "modern-compiler",
      },
      scss: {
        api: "modern-compiler",
      },
    },
  },
  plugins: [
    tailwindcss(),
  ]
});
