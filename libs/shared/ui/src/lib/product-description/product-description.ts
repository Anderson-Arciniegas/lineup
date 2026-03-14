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
    this.tags =
      this.product.productTags
        ?.map((pt) => pt.tag?.name)
        .filter((n): n is string => n != null) ?? [];

    const raw = this.product.description ?? '';
    const withNonBreakingHyphens = this._replaceHyphensInTextContent(raw);
    this.description = this._sanitizer.bypassSecurityTrustHtml(
      withNonBreakingHyphens,
    );
  }

  /**
   * Reemplaza guiones (-) por guion de no separación (U+2011) solo en el
   * contenido de texto del HTML, para que no se rompa la línea en cada guión.
   * No modifica guiones dentro de etiquetas ni atributos (p. ej. class="ql-align-center").
   */
  private _replaceHyphensInTextContent(html: string): string {
    return html.replace(/(^|>)([^<]*)(?=<|$)/g, (_, prefix, text) => {
      return prefix + text.replace(/-/g, '\u2011');
    });
  }
}
