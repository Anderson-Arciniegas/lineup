import { Page } from '@playwright/test';
import { businessSession, userSession } from './graphql-mock';

export type SessionKind = 'user' | 'business';

const ONBOARDING_PENDING_KEY = 'businessOnboardingPending';

/**
 * Simula sesión en localStorage; los guards completan vía mock GraphQL (`Me` / `MyBusiness`).
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

export async function seedOnboardingPending(page: Page): Promise<void> {
  await page.addInitScript((key: string) => {
    localStorage.setItem(key, JSON.stringify(true));
  }, ONBOARDING_PENDING_KEY);
}

export async function clearSession(page: Page): Promise<void> {
  await page.addInitScript((key: string) => {
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('sessionType');
    localStorage.removeItem(key);
  }, ONBOARDING_PENDING_KEY);
}

export { userSession, businessSession, ONBOARDING_PENDING_KEY };
