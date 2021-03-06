module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', 'react', 'react-hooks'],
  extends: [
    'standard',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
  ],
  settings: {
    react: {
      version: '16.8',
    },
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-object-literal-type-assertion': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'no-useless-constructor': 0,
    'react/prop-types': 0,
  },
}
