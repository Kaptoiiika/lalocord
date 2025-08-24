import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import { defineConfig } from 'eslint/config'
import _import from 'eslint-plugin-import'
import react from 'eslint-plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default defineConfig([
  {
    extends: fixupConfigRules(
      compat.extends(
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
      )
    ),

    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      react: fixupPluginRules(react),
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      parser: tsParser,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      '@typescript-eslint/consistent-type-imports': 'warn',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
          args: 'after-used',
          caughtErrors: 'none',
        },
      ],

      '@typescript-eslint/no-empty-object-type': 'off',
      'no-var': ['warn'],

      'no-unneeded-ternary': [
        'warn',
        {
          defaultAssignment: false,
        },
      ],

      'no-debugger': 'off',
      'object-shorthand': ['warn', 'always'],

      'arrow-body-style': ['warn'],

      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react/jsx-boolean-value': ['warn', 'never'],

      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'type', 'internal', ['parent', 'sibling'], 'index', 'object'],

          pathGroups: [
            {
              pattern: '{react,react-router-dom,react-dom/**}',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '{axios,@mui/**}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'app/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: 'page/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: 'widgets/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: 'features/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: 'shared/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '../*',
              group: 'parent',
              position: 'after',
            },
            {
              pattern: '{./*.scss,./**/*.scss,**/*.scss,*.css,**/*.css}',
              group: 'index',
              position: 'after',
            },
          ],

          distinctGroup: false,
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            orderImportKind: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
])
