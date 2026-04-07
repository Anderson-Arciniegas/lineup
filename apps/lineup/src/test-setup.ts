import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

// PrimeNG Tabs (and other components) use ResizeObserver; Jest/jsdom may not provide it.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {
      return;
    }
    unobserve(): void {
      return;
    }
    disconnect(): void {
      return;
    }
  };
}

// Polyfill for URL.createObjectURL and URL.revokeObjectURL in Jest environment
if (typeof URL.createObjectURL === 'undefined') {
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
}

// `@defer (on viewport)` y similares usan IntersectionObserver; jsdom no lo define.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserverMock
    implements IntersectionObserver
  {
    readonly root: Element | Document | null = null;
    readonly rootMargin = '';
    readonly thresholds: ReadonlyArray<number> = [];
    observe(): void {
      void 0;
    }
    unobserve(): void {
      void 0;
    }
    disconnect(): void {
      void 0;
    }
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  };
}

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
