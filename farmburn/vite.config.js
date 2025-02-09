import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
      name: 'farmburn',
      // the proper extensions will be added
      fileName: 'farmburn',
      formats: ['es'],
    },
    target: 'esnext',
    minify: false,
    outDir: '../bitburner',
    emptyOutDir: false
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    }
  },
  resolve: {
    alias: [
      { find: '@ns', replacement: fileURLToPath(new URL('./NetscriptDefinitions.d.ts', import.meta.url)) },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
})
