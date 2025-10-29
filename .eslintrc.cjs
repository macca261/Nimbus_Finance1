/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist', '.next', 'coverage'],
  env: {
    es2022: true,
    node: true,
    browser: true
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};


