import { CommonModule } from '@angular/common';
import { Component, computed, input, Input } from '@angular/core';
import { BASIC_COLORS, BASIC_SIZES } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from '../button/button';

@Component({
  selector: 'lib-product-variations',
  imports: [CommonModule, Button, TranslateModule],
  templateUrl: './product-variations.html',
  styleUrl: './product-variations.scss',
})
export class ProductVariations {
  @Input() title: string;
  readonly options = input<string[]>([]);
  selectedOption: string;
  readonly colorsVariations = BASIC_COLORS;
  readonly sizesVariations = BASIC_SIZES;

  readonly optionLabels = computed(() =>
    this.options().map((option) => ({
      option,
      label: this.getOptionLabel(option),
      color: this.getColor(option),
    })),
  );

  getOptionLabel(option: string): string {
    return (
      this.colorsVariations.find((c) => c.value === option)?.name ??
      this.sizesVariations.find((s) => s.value === option)?.name ??
      option
    );
  }

  getColor(option: string): string {
    return this.colorsVariations.find((c) => c.value === option)?.hex ?? null;
  }
}
