import { inject, Injectable, InjectionToken } from '@angular/core';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => {
      const val = store.get(key);
      return typeof val === 'string' ? val : null;
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => void store.delete(key),
    setItem: (key: string, value: string) => void store.set(key, value),
  } as Storage;
}

export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => {
    try {
      // Prefer real browser storage when available
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
    } catch {
      // ignore and fall back to memory
    }
    // Fallback for SSR or restricted environments
    return createMemoryStorage();
  },
});

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _inMemoryStorage: Record<string, unknown> = {};

  private _localStorage = inject(BROWSER_STORAGE);

  isSupported() {
    try {
      this._localStorage.setItem('test', 'test');
      this._localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  get(key: string) {
    if (this.isSupported()) {
      const item = this._localStorage.getItem(key);
      if (item) {
        try {
          return JSON.parse(item);
        } catch {
          // Limpiar dato corrupto
          this.remove(key);

          // Retornar null en lugar de crashear
          return null;
        }
      }
      return this._inMemoryStorage[key] || null;
    }
    return this._inMemoryStorage[key] || null;
  }

  set(key: string, value: unknown) {
    try {
      const serialized = JSON.stringify(value);

      if (this.isSupported()) {
        this._localStorage.setItem(key, serialized);
      } else {
        this._inMemoryStorage[key] = value;
      }
    } catch {
      // Manejar error de serialización (objetos circulares, etc.)
      throw new Error(`Failed to store value for key "${key}"`);
    }
  }

  remove(key: string) {
    if (this.isSupported()) {
      this._localStorage.removeItem(key);
    } else {
      delete this._inMemoryStorage[key];
    }
  }

  clear() {
    if (this.isSupported()) {
      this._localStorage.clear();
    } else {
      this._inMemoryStorage = {};
    }
  }
}
