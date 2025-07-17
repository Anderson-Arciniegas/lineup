import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-product-breadcrumb',
  imports: [CommonModule],
  templateUrl: './product-breadcrumb.html',
  styleUrl: './product-breadcrumb.scss',
})
export class ProductBreadcrumb {
  @Input() business: { name: string; image: string };
}
