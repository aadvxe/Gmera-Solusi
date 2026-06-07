// Import daftar global browser/node agar ESLint mengenali nama seperti window, document, dan process.
import globals from "globals";
// Import plugin React Hooks supaya ESLint bisa mengecek aturan useEffect/useState.
import reactHooks from "eslint-plugin-react-hooks";
// Import konfigurasi TypeScript ESLint supaya file .ts/.tsx dicek dengan parser TypeScript.
import tseslint from "typescript-eslint";

const reactHookWarnings = Object.fromEntries(
  // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh aturan lint project.
  Object.keys(reactHooks.configs.recommended.rules).map((ruleName) => [ruleName, "warn"])
);

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "eslint.config.mjs",
      "next-env.d.ts",
    ],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...reactHookWarnings,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-undef": "off",
    },
  },
];
