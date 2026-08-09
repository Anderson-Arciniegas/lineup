import { en } from './en';
import { es } from './es';

describe('i18n translation bundles', () => {
  it('en export is a non-empty object', () => {
    expect(en).toBeDefined();
    expect(typeof en).toBe('object');
    expect(Object.keys(en).length).toBeGreaterThan(0);
  });

  it('es export is a non-empty object', () => {
    expect(es).toBeDefined();
    expect(typeof es).toBe('object');
    expect(Object.keys(es).length).toBeGreaterThan(0);
  });
});
