import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { appRoutes } from '@lineup/core';

@Component({
  selector: 'lib-create-product-card',
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule
],
  templateUrl: './create-product-card.html',
  styleUrl: './create-product-card.scss',
})
export class CreateProductCard {
    @Input() width = 'w-65';
    @Input() height = 'h-100';
    route = appRoutes.createProduct;
}
