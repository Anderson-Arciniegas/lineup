import { ASSETS_PACKAGE } from './index';

describe('assets package', () => {
  it('exports ASSETS_PACKAGE constant', () => {
    expect(ASSETS_PACKAGE).toBe('@lineup/assets');
  });
});
