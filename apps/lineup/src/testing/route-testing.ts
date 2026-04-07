import { ParamMap, Params } from '@angular/router';

class FakeParamMap implements ParamMap {
  constructor(private readonly params: Params) {}
  get(name: string): string | undefined {
    const v = this.params[name];
    return v !== undefined && v !== null ? String(v) : undefined;
  }
  has(name: string): boolean {
    return name in this.params && this.params[name] != null;
  }
  getAll(_name: string): string[] {
    const v = this.get(_name);
    return v !== undefined ? [v] : [];
  }
  get keys(): string[] {
    return Object.keys(this.params);
  }
}

/**
 * `ActivatedRoute` mínimo con `snapshot.params` / `snapshot.paramMap` para vistas que leen la URL.
 */
export function createActivatedRouteMock(params: Params = {}) {
  const paramMap = new FakeParamMap(params);
  return {
    snapshot: {
      params,
      paramMap,
      queryParams: {},
      data: {},
    },
    params: undefined as unknown,
    paramMap: undefined as unknown,
  };
}
