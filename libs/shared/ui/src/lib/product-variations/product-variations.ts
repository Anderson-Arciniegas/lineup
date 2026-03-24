import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  Input,
  OnInit,
  OnChanges,
  output,
} from '@angular/core';
import { BASIC_COLORS, BASIC_SIZES } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'lib-product-variations',
  imports: [CommonModule, TranslateModule],
  templateUrl: './product-variations.html',
  styleUrl: './product-variations.scss',
})
export class ProductVariations implements OnInit, OnChanges {
  @Input() title: string;
  @Input() outOfStock: boolean;
  readonly options = input<string[]>([]);
  @Input() selectedOption: string | null = null;

  readonly selectedOptionChange = output<string>();
  readonly colorsVariations = BASIC_COLORS;
  readonly sizesVariations = BASIC_SIZES;

  /** Opciones sin duplicados (por valor normalizado) para evitar chips repetidos; el orden se preserva. */
  readonly optionLabels = computed(() => {
    const options = this.options();
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const opt of options) {
      const key = String(opt ?? '').trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(key);
    }
    return unique.map((option) => ({
      option,
      label: this.getOptionLabel(option),
      color: this.getColor(option),
    }));
  });

  ngOnInit(): void {
    this.ensureSelection();
  }

  ngOnChanges(): void {
    this.ensureSelection();
  }

  private ensureSelection(): void {
    const options = this.options();

    if (options.length === 0) {
      this.selectedOption = null;
      return;
    }

    // Si el padre no ha pasado una selección todavía (SSR/URL), evitamos
    // inventar una por defecto para prevenir mismatch SSR -> cliente.
    if (this.selectedOption == null) return;

    const normalizedCurrent = this.normalizeOption(this.selectedOption);
    const optionsNormalized = options.map((o) => this.normalizeOption(o));

    // Si la selección del padre existe en las opciones (comparación normalizada), mantenemos.
    if (normalizedCurrent && optionsNormalized.includes(normalizedCurrent)) return;

    // Si la selección del padre es inválida para este conjunto de opciones, la desactivamos.
    this.selectedOption = null;
  }

  /** Misma normalización que en optionLabels para comparar selección sin duplicados por espacios. */
  normalizeOption(value: string | null | undefined): string {
    return String(value ?? '').trim();
  }

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

  selectOption(option: string): void {
    if (this.selectedOption === option) return;
    this.selectedOption = option;
    this.selectedOptionChange.emit(option);
  }
}
