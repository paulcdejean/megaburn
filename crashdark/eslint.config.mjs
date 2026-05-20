// @ts-check

import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "NetscriptDefinitions.d.ts",
    "globals.d.ts",
    "eslint.config.mjs",
    "vite.config.js",
  ]),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
