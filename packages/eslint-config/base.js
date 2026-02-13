import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  languageOptions: {
    globals: {
      ...globals.node,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-duplicate-imports': 'error',
  },
});
