import { formatDate } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** Fecha corta con fecha y hora según locale (p. ej. movimientos). */
export type LocaleDateKind = 'date' | 'datetime' | 'short';

@Pipe({
  name: 'localeDate',
  standalone: true,
  pure: false,
})
export class LocaleDatePipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(
    value: Date | string | number | null | undefined,
    kind: LocaleDateKind = 'date',
  ): string {
    if (value == null || value === '') {
      return '';
    }
    const lang =
      this.translate.currentLang ??
      this.translate.getDefaultLang() ??
      'es';
    const locale = lang === 'en' ? 'en-US' : 'es';

    if (kind === 'short') {
      return formatDate(value, 'short', locale);
    }

    const isEn = lang === 'en';
    if (kind === 'datetime') {
      const pattern = isEn ? 'MM/dd/yyyy, h:mm a' : 'dd/MM/yyyy HH:mm';
      return formatDate(value, pattern, locale);
    }

    const pattern = isEn ? 'MM/dd/yyyy' : 'dd/MM/yyyy';
    return formatDate(value, pattern, locale);
  }
}
