import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { DiscountSchema } from '@lineup/core';
import { DiscountTypeEnum, CurrencySymbolPipe } from '@lineup/core';
import { Button } from '../button/button';

@Component({
  selector: 'lib-discount-item',
  imports: [CommonModule, Button, CurrencySymbolPipe],
  templateUrl: './discount-item.html',
  styleUrl: './discount-item.scss',
})
export class DiscountItem {
  @Input() discount!: DiscountSchema;

  @Output() edit = new EventEmitter<DiscountSchema>();
  @Output() delete = new EventEmitter<number>();

  readonly DiscountTypeEnum = DiscountTypeEnum;
}

