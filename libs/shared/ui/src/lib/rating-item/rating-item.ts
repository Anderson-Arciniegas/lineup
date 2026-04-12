import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ProductRatingSchema } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';

/** Valoración del usuario con enlace al producto y miniatura. */
@Component({
  selector: 'lib-rating-item',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './rating-item.html',
  styleUrl: './rating-item.scss',
})
export class RatingItem {
  @Input({ required: true }) rating!: ProductRatingSchema;

  readonly stars = [1, 2, 3, 4, 5] as const;

  /** Ruta pública `/negocio/catálogo/id` si hay datos suficientes en `rating.product`. */
  get productUrl(): string | null {
    const product = this.rating.product;
    if (
      product?.id != null &&
      product.business?.path &&
      product.catalog?.path
    ) {
      return `/${product.business.path}/${product.catalog.path}/${product.id}`;
    }
    return null;
  }

  /** URL del primer archivo de imagen del producto valorado. */
  get productImageUrl(): string | undefined {
    return this.rating.product?.productFiles?.[0]?.file?.url;
  }
}
