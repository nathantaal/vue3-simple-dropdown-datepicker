import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [vue(), dts({ entryRoot: 'src' })],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: 'src/index.ts',
      name: 'DateDropdown',
      formats: ['es', 'cjs'],
      // Explicit extensions so Node picks the right module system without "type": "module".
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        assetFileNames: (asset) => (asset.name?.endsWith('.css') ? 'style.css' : asset.name!),
      },
    },
  },
});
