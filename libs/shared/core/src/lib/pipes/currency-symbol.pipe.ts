import { getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySymbol',
  standalone: true,
})
export class CurrencySymbolPipe implements PipeTransform {
  transform(
    currencyCode: string | null | undefined,
    useNarrowSymbol = true,
  ): string {
    if (!currencyCode) {
      return '';
    }

    const normalizedCode = currencyCode.toUpperCase();

    if (normalizedCode === 'BS') {
      return 'Bs';
    }

    try {
      return getCurrencySymbol(
        normalizedCode,
        useNarrowSymbol ? 'narrow' : 'wide',
      );
    } catch {
      return normalizedCode;
    }
  }
}
