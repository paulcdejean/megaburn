import { resolve } from "node:path";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
	plugins: [wasm()],
	build: {
		target: "esnext",
		outDir: "bitburner",
		emptyOutDir: false,
		rollupOptions: {
			preserveEntrySignatures: "strict",
			input: {
				rouletteburn: resolve(__dirname, "packages/rouletteburn/src/main.ts"),
			},
			output: {
				entryFileNames: "[name].js",
			},
		},
	},
	css: {
		modules: {
			localsConvention: "camelCaseOnly",
		},
	},
	resolve: {
		alias: [
			{
				find: "@rust",
				replacement: resolve(
					__dirname,
					"packages/rouletteburn/pkg/rouletteburn.js",
				),
			},
		],
	},
});
