/** @type {import('jest').Config} */
module.exports = {
  // jest-expo preset handles React Native + Expo module resolution and TypeScript
  preset: 'jest-expo',

  // Module file extensions (order matters)
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Transform node_modules that ship as ESM (needed for some Expo/React Native packages)
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|expo(nent)?' +
      '|@expo(nent)?/.*' +
      '|@expo-google-fonts/.*' +
      '|react-navigation' +
      '|@react-navigation/.*' +
      '|@unimodules/.*' +
      '|unimodules' +
      '|sentry-expo' +
      '|native-base' +
      '|react-native-svg' +
      ')/)',
  ],

  // Collect coverage from src
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
