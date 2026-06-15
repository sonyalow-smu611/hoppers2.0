import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
  },
]);

export default eslintConfig;
