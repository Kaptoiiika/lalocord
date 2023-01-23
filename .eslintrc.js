module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "plugin:react/recommended",
    "plugin:storybook/recommended",
    "@feature-sliced",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  plugins: ["react", "react-hooks", "@typescript-eslint"],
  rules: {
    "react/jsx-indent": ["warn", 2],
    "react/jsx-indent-props": ["warn", 2],
    "react/jsx-filename-extension": [
      2,
      {
        extensions: [".js", ".jsx", ".tsx"],
      },
    ],
    "react/jsx-props-no-spreading": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { args: "after-used" }],
    "react/require-default-props": "off",
    "react/react-in-jsx-scope": "off",
    "react/function-component-definition": "off",
    "no-shadow": "off",
    "import/extensions": "off",
    "import/no-extraneous-dependencies": "off",
    "no-underscore-dangle": "off",
    "react/display-name": "off",
    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies,
    "import/no-internal-modules": "off",
    "import/order": "warn",
    "import/no-unresolved": "off",
    "import/prefer-default-export": "off",
  },
  globals: {
    __IS_DEV__: true,
  },
  overrides: [
    {
      files: ["**/src/**/*.test.{ts,tsx}"],
      rules: {
        "i18next/no-literal-string": ["off"],
      },
    },
    {
      files: ["**/src/**/*.stories.tsx"],
      rules: {
        "react/jsx-props-no-spreading": ["off"],
        "i18next/no-literal-string": ["off"],
      },
    },
  ],
}
