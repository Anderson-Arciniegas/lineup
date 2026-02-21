import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CurrencySymbolPipe, ProductSchema } from '@lineup/core';
import { ProductTags } from '../product-tags/product-tags';

@Component({
  selector: 'lib-product-description',
  imports: [CommonModule, ProductTags, CurrencySymbolPipe],
  templateUrl: './product-description.html',
  styleUrl: './product-description.scss',
})
export class ProductDescription implements OnInit {
  @Input() product: ProductSchema;
  tags = ['New', 'NFL', 'Shirt', 'Futbol Americano', 'Ravens', 'Nike'];
  description: SafeHtml;

  private readonly _sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.tags = this.product.tags;

    this.description = this._sanitizer.bypassSecurityTrustHtml(
      this.product.description ?? '',
    );
  }
}
