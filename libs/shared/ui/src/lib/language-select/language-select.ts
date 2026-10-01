import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';

interface LanguageOption {
  code: string;
  symbol: string;
}

/**
 * Selector de idioma solo código (ES / EN) para headers (HU-30 / RF59).
 */
@Component({
  selector: 'lib-language-select',
  standalone: true,
  imports: [FormsModule, SelectModule, TranslateModule],
  templateUrl: './language-select.html',
  styleUrl: './language-select.scss',
})
export class LanguageSelect {
  private readonly _languageService = inject(LanguageService);

  readonly options: LanguageOption[] = [
    { code: 'ES', symbol: 'es' },
    { code: 'EN', symbol: 'en' },
  ];

  readonly currentLanguage = this._languageService.currentLanguage;

  onLanguageChange(symbol: string): void {
    this._languageService.setLanguage(symbol);
  }
}
