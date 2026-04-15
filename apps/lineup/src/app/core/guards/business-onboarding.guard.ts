import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AppConfigService, StorageService } from '@lineup/core';

const ONBOARDING_PENDING_KEY = 'businessOnboardingPending';

export const BusinessOnboardingGuard: CanActivateFn = (): boolean | UrlTree => {
  const platformId = inject(PLATFORM_ID);
  const storage = inject(StorageService);
  const router = inject(Router);

  const dashboardUrl = router.createUrlTree([
    AppConfigService.config.routes.dashboard,
  ]);

  if (!isPlatformBrowser(platformId)) {
    return dashboardUrl;
  }

  return storage.get(ONBOARDING_PENDING_KEY) ? true : dashboardUrl;
};

