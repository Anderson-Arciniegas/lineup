import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../button/button';
import { ButtonSeverity } from 'primeng/button';

@Component({
  selector: 'lib-product-variations',
  imports: [
    CommonModule,
    Button,
  ],
  templateUrl: './product-variations.html',
  styleUrl: './product-variations.scss',
})
export class ProductVariations {
  @Input() title: string;
  @Input() variations: { name: string; primary: boolean }[] = [];
}
