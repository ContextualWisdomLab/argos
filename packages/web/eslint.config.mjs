import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat()

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ['node_modules', '.next', 'dist', 'build'],
  },
  {
    files: ['src/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]

export default eslintConfig
