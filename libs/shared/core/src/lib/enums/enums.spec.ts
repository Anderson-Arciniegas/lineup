import * as enums from './index';

describe('enums', () => {
  const entries = Object.entries(enums);

  it('exports enum objects', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)('%s is defined', (_name, value) => {
    expect(value).toBeDefined();
  });
});
