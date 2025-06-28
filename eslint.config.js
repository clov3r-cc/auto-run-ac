import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEsLint from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import pluginStylistic from '@stylistic/eslint-plugin';
import pluginReact from 'eslint-plugin-react';
import pluginHooks from 'eslint-plugin-react-hooks';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import { defineConfig } from 'eslint/config';
import configPrettier from 'eslint-config-prettier';

// TODO: add ESLint config for vitest

const stylisticConfig = {
  name: 'Stylistic Config',
  files: ['**/*.{js,ts,jsx,tsx}'],
  plugins: {
    '@stylistic': pluginStylistic,
  },
  rules: {
    '@stylistic/padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: ['return', 'throw'] },
      { blankLine: 'always', prev: '*', next: ['function', `class`] },
      { blankLine: 'always', prev: '*', next: ['if', 'switch'] },
      { blankLine: 'always', prev: 'directive', next: '*' },
      { blankLine: 'never', prev: 'directive', next: 'directive' },
    ],
  },
};

const importConfig = {
  name: 'Import Config',
  files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  plugins: {
    import: pluginImport,
    'simple-import-sort': pluginSimpleImportSort,
    'unused-imports': pluginUnusedImports,
  },
  settings: {
    ...pluginImport.configs.react.settings,
    ...pluginImport.configs.typescript.settings,
    'import/resolver': {
      ...pluginImport.configs.typescript.settings['import/resolver'],
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    ...pluginImport.configs.recommended.rules,
    ...pluginImport.configs.typescript.rules,
    'import/extensions': [
      'error',
      'always',
      {
        js: 'always',
        jsx: 'always',
        ts: 'always',
        tsx: 'always',
        ignorePackages: true,
      },
    ],

    // for eslint-plugin-simple-import-sort
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^react(-dom)?', '^node:', '^@?\\w', '^@/.*', '^\\.+/(?!assets/)'],
          ['^.+\\.json$', '^.+\\.(svg|png|jpg)$', '^.+\\.s?css$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-unresolved': [
      'error',
      {
        ignore: [
          '^/.+\\.(svg|png|jpg)$',
          '^virtual:react-router/server-build$',
        ],
      },
    ],

    // for eslint-plugin-unused-imports
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
    'no-restricted-imports': [
      'error',
      { name: 'zod', message: 'Use zod/v4 instead.' },
    ],
  },
};

const reactConfig = {
  name: 'React Config',
  files: ['app/**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    ...pluginJsxA11y.flatConfigs.recommended.languageOptions,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: {
    react: pluginReact,
    'react-hooks': pluginHooks,
    'jsx-a11y': pluginJsxA11y,
  },
  rules: {
    ...pluginReact.configs.flat.recommended.rules,
    ...pluginHooks.configs.recommended.rules,
    ...pluginJsxA11y.flatConfigs.recommended.rules,
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'] },
  {
    ignores: [
      '{dist,build,public,node_modules,.react-router}/**',
      '**/lib/utils.{js,ts}',
      '**/components/ui/**/*.{jsx,tsx}',
      '**/*.config.*',
      'worker-configuration.d.ts',
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2025,
      },
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.*.json'],
      },
    },
  },
  pluginJs.configs.recommended,
  tsEsLint.configs.recommendedTypeChecked,
  tsEsLint.configs.stylistic,
  reactConfig,
  importConfig,
  stylisticConfig,
  configPrettier,
]);
