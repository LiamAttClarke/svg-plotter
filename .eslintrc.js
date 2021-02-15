const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.d.ts'],
        paths: ['node_modules/', 'node_modules/@types/'],
      }
    }
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript/base',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'no-console': isProduction ? 'error' : 'warn',
    'import/extensions': 'off',
    '@typescript-eslint/type-annotation-spacing': 2,
  }
};
