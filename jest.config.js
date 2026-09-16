module.exports = {
  preset: 'react-native',
  //Tells Jest to load your custom mocks after the testing environment is initialized for every test file.
  setupFilesAfterEnv: ['./jest.setup.js'],
  // tells Jest: "Do NOT ignore these specific packages; compile them through Babel before running tests."
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|@react-navigation|lucide-react-native|@reduxjs/toolkit|react-redux|immer)/',
  ],
  //Directs any media file import to our mocks/fileMock.js
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  //Limits coverage calculations only to actionable source code in src/, ignoring types and static assets.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/assests/**',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
};
