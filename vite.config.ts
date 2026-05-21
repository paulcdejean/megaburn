import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "bitburner",
		emptyOutDir: false,
		rollupOptions: {
			input: {
				rouletteburn: resolve(__dirname, "packages/rouletteburn/src/main.ts"),
			},
			output: {
				entryFileNames: "[name].js",
			},
		},
	},
});
