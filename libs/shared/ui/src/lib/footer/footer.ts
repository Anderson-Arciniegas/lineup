import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppConfigService, appRoutes, AuthStore } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from '../button/button';

/** Pie de página público con enlaces legales, contacto y créditos; adapta CTA según sesión. */
@Component({
  selector: 'lib-footer',
  imports: [CommonModule, RouterModule, TranslateModule, Button],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly currentYear = new Date().getFullYear();
  private readonly _routes = AppConfigService.config.routes ?? appRoutes;
  readonly infoPath = `/${this._routes.info}`;
  readonly termsPath = `/${this._routes.info}/${this._routes.termsAndConditions}`;
  readonly privacyPath = `/${this._routes.info}/${this._routes.privacyPolicy}`;
  readonly gmailComposeUrl =
    'https://mail.google.com/mail/?view=cm&fs=1&to=lineup@lineup.com.ve';

  private _authStore = inject(AuthStore);

  omarGitHubUrl = 'https://github.com/OmarJr11';
  anderGitHubUrl = 'https://github.com/Anderson-Arciniegas';

  // Computed signals - se actualizan automáticamente
  logged = computed(
    () =>
      this._authStore.isUserLoggedIn() || this._authStore.isBusinessLoggedIn(),
  );

  businessMode = computed(() => this._authStore.isBusinessLoggedIn());
}
