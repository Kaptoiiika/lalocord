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
              pattern: '{./*.scss,./**/*.scss,**/*.scss}',
              group: 'index',
              position: 'after',
            },
            {
              pattern: '{react,react-redux,redux/**,react-router-dom,react-dom/**}',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '{axios,@mui/**}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'lodash',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '{api/**,components/**,routes/**,ui-kit/**,utils/**,pages/**}',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '{api,hooks,constants/**,context,routes,theme}',
              group: 'type',
              position: 'after',
            },
            {
              pattern: 'assets/**',
              group: 'sibling',
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

