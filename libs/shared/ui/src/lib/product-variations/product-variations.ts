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

/**
 * Selector de una variación de producto (color/talla u otras): chips con etiquetas i18n,
 * colores hex cuando aplica y `output` al cambiar la opción.
 */
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

  /** Valida la selección inicial frente a las opciones disponibles. */
  ngOnInit(): void {
    this.ensureSelection();
  }

  /** Revalida cuando el padre actualiza `options` o `selectedOption`. */
  ngOnChanges(): void {
    this.ensureSelection();
  }

  /**
   * Evita selección inválida tras cambiar opciones; no impone default si el padre aún no definió valor (SSR/URL).
   */
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

  /** Resuelve clave de traducción para colores/tallas predefinidos o devuelve el valor crudo. */
  getOptionLabel(option: string): string {
    return (
      this.colorsVariations.find((c) => c.value === option)?.name ??
      this.sizesVariations.find((s) => s.value === option)?.name ??
      option
    );
  }

  /** Hex del color si la opción coincide con `BASIC_COLORS`. */
  getColor(option: string): string {
    return this.colorsVariations.find((c) => c.value === option)?.hex ?? null;
  }

  /** Emite `selectedOptionChange` cuando el usuario elige otra opción. */
  selectOption(option: string): void {
    if (this.selectedOption === option) return;
    this.selectedOption = option;
    this.selectedOptionChange.emit(option);
  }
}
