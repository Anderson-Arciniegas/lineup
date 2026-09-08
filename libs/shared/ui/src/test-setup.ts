import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

// Polyfill for URL.createObjectURL and URL.revokeObjectURL in Jest environment
if (typeof URL.createObjectURL === 'undefined') {
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
}

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});
