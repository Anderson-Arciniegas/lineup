import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { ProductRatingSchema } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Muestra una valoración en contexto de panel de negocio (autor, estrellas, texto).
 */
@Component({
  selector: 'lib-product-rating-item',
  imports: [CommonModule, TranslateModule],
  templateUrl: './product-rating-item.html',
  styleUrl: './product-rating-item.scss',
})
export class ProductRatingItem {
  @Input({ required: true }) rating!: ProductRatingSchema;

  readonly stars = [1, 2, 3, 4, 5] as const;

  /** Avatar del usuario que creó la valoración. */
  get creatorProfileImageUrl(): string | undefined {
    const url = this.rating.creationUser?.profileImage?.url;
    return url?.trim() || undefined;
  }

  /** Prioriza `username` y si no hay, concatena nombre y apellido. */
  get creatorDisplayName(): string {
    const u = this.rating.creationUser;
    const name = u?.username?.trim();
    if (name) return name;
    const full = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim();
    return full;
  }
}
