import { CurrencySymbolPipe } from './currency-symbol.pipe';

describe('CurrencySymbolPipe', () => {
  const pipe = new CurrencySymbolPipe();

  it('returns empty string for missing code', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('returns Bs for BS code', () => {
    expect(pipe.transform('BS')).toBe('Bs');
  });

  it('returns currency symbol for USD', () => {
    expect(pipe.transform('USD')).toBe('$');
  });

  it('returns fallback for unknown currency', () => {
    const result = pipe.transform('XXX');
    expect(typeof result).toBe('string');
  });

  it('supports wide currency symbol format', () => {
    expect(pipe.transform('USD', false)).toBe('$');
  });
});
