import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BusinessSchema,
  CurrencySymbolPipe,
  DiscountSchema,
  DiscountScopeEnum,
  DiscountTypeEnum,
  FileThumbnailUrlPipe,
  StatusEnum,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

/**
 * Tarjeta resumen de negocio para listados: imagen, seguidores formateados y descuento a nivel negocio si aplica.
 */
@Component({
  selector: 'lib-business-card',
  imports: [
    CommonModule,
    CardModule,
    FileThumbnailUrlPipe,
    ProgressSpinnerModule,
    RouterLink,
    TranslateModule,
    CurrencySymbolPipe,
  ],
  templateUrl: './business-card.html',
  styleUrl: './business-card.scss',
})
export class BusinessCard implements OnInit {
  @Input() width = 'w-40';
  @Input() height = 'h-50';
  @Input() favoritesMode = false;
  @Input() business: BusinessSchema;
  discount: DiscountSchema;
  image: string;
  imageLoaded: boolean;
  images = [
    'assets/images/vShop.jpg',
    'assets/images/business/business-1.jpg',
    'assets/images/business/business-2.jpg',
    'assets/images/business/business-3.jpg',
  ];
  DiscountTypeEnum = DiscountTypeEnum;
  DiscountScopeEnum = DiscountScopeEnum;

  /** Elige imagen placeholder aleatoria y detecta descuento activo con alcance `BUSINESS`. */
  ngOnInit(): void {
    this.image = this.images[Math.floor(Math.random() * this.images.length)];

    this.discount = this.business?.discounts?.find(
      (discount) =>
        discount.scope === DiscountScopeEnum.BUSINESS &&
        discount.status === StatusEnum.ACTIVE,
    );
  }

  /** Abrevia millones (`M`) y miles (`m`) para mostrar conteo de seguidores. */
  formatFollowers(count: number): string {
    if (count == null || count < 0) return '0';
    if (count >= 1_000_000) {
      const value = count / 1_000_000;
      const display = value % 1 === 0 ? value : Math.floor(value * 10) / 10;
      return `${display} M`;
    }
    if (count >= 1_000) {
      const value = count / 1_000;
      const display = value % 1 === 0 ? value : Math.floor(value * 10) / 10;
      return `${display} m`;
    }
    return String(count);
  }
}
