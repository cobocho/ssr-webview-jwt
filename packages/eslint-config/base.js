import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  plugins: {
    'simple-import-sort': simpleImportSort,
    'unused-imports': unusedImports,
  },
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
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
});
