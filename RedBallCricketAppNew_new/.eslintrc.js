module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Allow Windows CRLF line endings
    'linebreak-style': 'off',
    // Relax formatting rules to avoid blocking builds on style
  'prettier/prettier': 'off',
  curly: 'off',
  'react-native/no-inline-styles': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
        'linebreak-style': 'off',
      },
    },
  ],
};
