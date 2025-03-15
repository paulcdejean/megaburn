/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url';

import wasm from "vite-plugin-wasm";

export default defineConfig({
  test: {
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
      name: 'ipfish',
      fileName: 'ipfish',
      formats: ['es'],
    },
    target: 'esnext',
    minify: false,
    outDir: '../bitburner',
    emptyOutDir: false
  },
  plugins: [
    wasm(),
  ],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    }
  },
  resolve: {
    alias: [
      { find: '@rust', replacement: fileURLToPath(new URL('./pkg/ipfish.js', import.meta.url)) },
      { find: '@ns', replacement: fileURLToPath(new URL('../NetscriptDefinitions.d.ts', import.meta.url)) },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  worker: {
    plugins: [
      wasm(),
    ],
    format: "es",
  }
})
