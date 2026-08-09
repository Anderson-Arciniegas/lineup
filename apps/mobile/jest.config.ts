export default {
  displayName: 'mobile',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/mobile',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/test-setup.ts',
    '!src/main.ts',
    '!src/polyfills.ts',
    '!src/**/*.routes.ts',
    '!src/**/index.ts',
    '!src/testing/**',
  ],
  moduleNameMapper: {
    '^@ionic/angular/standalone$': '<rootDir>/src/testing/ionic-standalone.mock.ts',
    '^@ionic/angular$': '<rootDir>/src/testing/ionic.mock.ts',
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
