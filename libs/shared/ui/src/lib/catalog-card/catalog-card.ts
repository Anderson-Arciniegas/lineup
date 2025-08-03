import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'lib-catalog-card',
  imports: [
    CommonModule,
    CardModule,
    RouterLink
  ],
  templateUrl: './catalog-card.html',
  styleUrl: './catalog-card.scss',
})
export class CatalogCard {
    @Input() width = 'w-72';
    @Input() height = 'h-96';
}
