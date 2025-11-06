import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginQuery from '@tanstack/eslint-plugin-query'
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended", "plugin:react/jsx-runtime"],
    languageOptions: { globals: globals.browser }
  },
  tseslint.configs.recommended,
  // @ts-expect-error: probably a bug in eslint
  pluginReact.configs.flat.recommended,
  ...pluginQuery.configs['flat/recommended'],
]);