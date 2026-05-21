import { resolve } from "node:path";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
	plugins: [
		wasm(),
		{
			name: "no-css-emit",
			generateBundle(_, bundle) {
				for (const key of Object.keys(bundle)) {
					if (key.endsWith(".css")) delete bundle[key];
				}
			},
		},
	],
	build: {
		target: "esnext",
		outDir: "bitburner",
		emptyOutDir: false,
		assetsInlineLimit: 1024 * 1024,
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
