import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ProductSchema } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductDescription } from '../product-description/product-description';
import { ProductDetails } from '../product-details/product-details';

/** Agrupa descripción enriquecida y bloque de detalles (precio, variaciones, acciones) del producto. */
@Component({
  selector: 'lib-product-info',
  imports: [
    CommonModule,
    SkeletonModule,
    ProductDescription,
    ProductDetails,
    TranslateModule,
  ],
  templateUrl: './product-info.html',
  styleUrl: './product-info.scss',
})
export class ProductInfo {
  @Input() product: ProductSchema;
}
