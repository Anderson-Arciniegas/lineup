import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { DiscountSchema } from '@lineup/core';
import {
  CurrencySymbolPipe,
  DiscountScopeEnum,
  DiscountTypeEnum,
} from '@lineup/core';
import { LocaleDatePipe } from '@lineup/core';
import { Button } from '../button/button';

@Component({
  selector: 'lib-discount-item',
  imports: [
    CommonModule,
    Button,
    CurrencySymbolPipe,
    LocaleDatePipe,
    RouterLink,
  ],
  templateUrl: './discount-item.html',
  styleUrl: './discount-item.scss',
})
export class DiscountItem {
  @Input() discount!: DiscountSchema;

  @Output() edit = new EventEmitter<DiscountSchema>();
  @Output() delete = new EventEmitter<number>();
  readonly DiscountScopeEnum = DiscountScopeEnum;

  readonly DiscountTypeEnum = DiscountTypeEnum;

  setLabel(title: string | null | undefined, maxLength = 20): string {
    const t = title ?? '';
    return t.length > maxLength ? t.substring(0, maxLength) + '...' : t;
  }
}
