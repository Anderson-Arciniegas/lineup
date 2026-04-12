import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppConfigService } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Tarjeta CTA para crear un producto nuevo dentro de un catálogo del panel (`catalogPath` requerido).
 */
@Component({
  selector: 'lib-create-product-card',
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './create-product-card.html',
  styleUrl: './create-product-card.scss',
})
export class CreateProductCard {
  @Input() width = 'w-65';
  @Input() height = 'h-100';
  @Input() catalogPath!: string;

  /** Segmentos de ruta hacia el formulario de alta de producto en el dashboard. */
  get route(): string[] {
    return [
      '/',
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.catalogs,
      this.catalogPath,
      AppConfigService.config.routes.createProduct,
    ];
  }
}
