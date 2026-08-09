import { Page } from '@playwright/test';
import { businessSession, userSession } from './graphql-mock';

export type SessionKind = 'user' | 'business';

/**
 * Simula sesión en localStorage; los guards completan vía mock GraphQL (getMe / myBusiness).
 */
export async function seedSession(
  page: Page,
  kind: SessionKind,
): Promise<void> {
  await page.addInitScript((sessionType: SessionKind) => {
    localStorage.setItem('loggedUser', JSON.stringify(true));
    localStorage.setItem('sessionType', JSON.stringify(sessionType));
  }, kind);
}

export async function clearSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('sessionType');
    localStorage.removeItem('businessOnboardingPending');
  });
}

export { userSession, businessSession };
