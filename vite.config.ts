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
      fileName: (format) => (format === 'es' ? 'index.esm.js' : 'index.cjs.js'),
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
