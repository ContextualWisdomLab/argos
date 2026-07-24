import coreWebVitals from 'eslint-config-next/core-web-vitals.js'
import nextTypescript from 'eslint-config-next/typescript.js'

const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]

export default eslintConfig
