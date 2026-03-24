import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

// PrimeNG Tabs (and other components) use ResizeObserver; Jest/jsdom may not provide it.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

// Polyfill for URL.createObjectURL and URL.revokeObjectURL in Jest environment
if (typeof URL.createObjectURL === 'undefined') {
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
}

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
