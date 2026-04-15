import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/** Página de términos y condiciones (texto orientativo en i18n; revisar con asesoría legal). */
@Component({
  selector: 'app-terms-and-conditions-page',
  imports: [CommonModule, TranslateModule],
  templateUrl: './terms-and-conditions-page.html',
  styleUrl: './terms-and-conditions-page.scss',
})
export class TermsAndConditionsPage {}
