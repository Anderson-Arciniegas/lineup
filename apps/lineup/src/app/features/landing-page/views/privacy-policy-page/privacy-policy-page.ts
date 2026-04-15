import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/** Página de política de privacidad (texto orientativo en i18n; revisar con asesoría legal). */
@Component({
  selector: 'app-privacy-policy-page',
  imports: [CommonModule, TranslateModule],
  templateUrl: './privacy-policy-page.html',
  styleUrl: './privacy-policy-page.scss',
})
export class PrivacyPolicyPage {}
