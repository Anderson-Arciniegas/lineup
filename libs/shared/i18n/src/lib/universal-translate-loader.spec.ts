import { firstValueFrom } from 'rxjs';
import { UniversalTranslateLoader } from './universal-translate-loader';

describe('UniversalTranslateLoader', () => {
  const loader = new UniversalTranslateLoader();

  it('loads English translations', async () => {
    const translations = await firstValueFrom(loader.getTranslation('en'));
    expect(Object.keys(translations).length).toBeGreaterThan(0);
  });

  it('loads Spanish translations for es', async () => {
    const translations = await firstValueFrom(loader.getTranslation('es'));
    expect(Object.keys(translations).length).toBeGreaterThan(0);
  });

  it('falls back to Spanish for unknown languages', async () => {
    const translations = await firstValueFrom(loader.getTranslation('fr'));
    expect(Object.keys(translations).length).toBeGreaterThan(0);
  });
});
