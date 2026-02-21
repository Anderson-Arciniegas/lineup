import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from '../button/button';

@Component({
  selector: 'lib-product-variations',
  imports: [CommonModule, Button, TranslateModule],
  templateUrl: './product-variations.html',
  styleUrl: './product-variations.scss',
})
export class ProductVariations {
  @Input() title: string;
  @Input() options: string[] = [];
  selectedOption: string;
}
