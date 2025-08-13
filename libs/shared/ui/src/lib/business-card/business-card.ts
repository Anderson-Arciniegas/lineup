import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'lib-business-card',
  imports: [
    CommonModule,
    CardModule,
    RouterLink
  ],
  templateUrl: './business-card.html',
  styleUrl: './business-card.scss',
})
export class BusinessCard {
  @Input() width = 'w-40';
  @Input() height = 'h-50';
}
