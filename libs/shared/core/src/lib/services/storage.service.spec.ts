import { TestBed } from '@angular/core/testing';
import { createMemoryStorageMock } from '../../testing';
import { BROWSER_STORAGE, StorageService } from './storage.service';

function createUnsupportedStorageMock(): Storage {
  return {
    get length() {
      return 0;
    },
    clear: jest.fn(),
    getItem: jest.fn().mockReturnValue(null),
    key: jest.fn().mockReturnValue(null),
    removeItem: jest.fn(),
    setItem: jest.fn(() => {
      throw new Error('Storage unavailable');
    }),
  } as Storage;
}

describe('StorageService', () => {
  let service: StorageService;
  let storage: Storage;

  beforeEach(() => {
    storage = createMemoryStorageMock();
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: BROWSER_STORAGE, useValue: storage },
      ],
    });
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isSupported returns true with memory storage', () => {
    expect(service.isSupported()).toBe(true);
  });

  it('set and get roundtrip JSON values', () => {
    service.set('key', { foo: 'bar' });
    expect(service.get('key')).toEqual({ foo: 'bar' });
  });

  it('remove deletes stored value', () => {
    service.set('key', 'value');
    service.remove('key');
    expect(service.get('key')).toBeNull();
  });

  it('clear removes all stored values', () => {
    service.set('a', 1);
    service.set('b', 2);
    service.clear();
    expect(service.get('a')).toBeNull();
    expect(service.get('b')).toBeNull();
  });

  it('get returns null for corrupt JSON and removes key', () => {
    storage.setItem('bad', 'not-json');
    expect(service.get('bad')).toBeNull();
    expect(storage.getItem('bad')).toBeNull();
  });

  it('uses in-memory storage when browser storage is unsupported', () => {
    TestBed.resetTestingModule();
    const unsupported = createUnsupportedStorageMock();
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: BROWSER_STORAGE, useValue: unsupported },
      ],
    });
    const unsupportedService = TestBed.inject(StorageService);

    expect(unsupportedService.isSupported()).toBe(false);
    unsupportedService.set('key', 'value');
    expect(unsupportedService.get('key')).toBe('value');
    unsupportedService.remove('key');
    expect(unsupportedService.get('key')).toBeNull();
    unsupportedService.set('a', 1);
    unsupportedService.clear();
    expect(unsupportedService.get('a')).toBeNull();
  });

  it('set throws when value cannot be serialized', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;
    expect(() => service.set('bad', circular)).toThrow(
      'Failed to store value for key "bad"',
    );
  });
});

describe('BROWSER_STORAGE factory', () => {
  it('falls back to memory storage when localStorage is unavailable', () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: undefined,
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const memoryStorage = TestBed.inject(BROWSER_STORAGE);
    memoryStorage.setItem('k', 'v');
    expect(memoryStorage.getItem('k')).toBe('v');
    expect(memoryStorage.key(0)).toBe('k');
    expect(memoryStorage.length).toBe(1);
    memoryStorage.removeItem('k');
    memoryStorage.clear();
    expect(memoryStorage.length).toBe(0);

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });
});
