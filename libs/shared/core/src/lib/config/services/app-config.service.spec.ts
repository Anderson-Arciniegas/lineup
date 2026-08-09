import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  it('exposes static config with routes and languages', () => {
    expect(AppConfigService.config.routes).toBeDefined();
    expect(AppConfigService.config.languages).toBeDefined();
    expect(Array.isArray(AppConfigService.config.languages)).toBe(true);
  });
});
