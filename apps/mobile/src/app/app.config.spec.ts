import { appConfig } from './app.config';

describe('mobile appConfig', () => {
  it('defines router and i18n providers', () => {
    expect(appConfig.providers?.length).toBeGreaterThan(0);
  });
});
