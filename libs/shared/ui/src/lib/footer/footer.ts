import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@lineup/core';
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
