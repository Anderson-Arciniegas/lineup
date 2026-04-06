import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BusinessSchema, FileThumbnailUrlPipe } from '@lineup/core';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'lib-business-card',
  imports: [
    CommonModule,
    CardModule,
    FileThumbnailUrlPipe,
    ProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './business-card.html',
  styleUrl: './business-card.scss',
})
export class BusinessCard implements OnInit {
  @Input() width = 'w-40';
  @Input() height = 'h-50';
  @Input() favoritesMode = false;
  @Input() business: BusinessSchema;
  image: string;
  imageLoaded: boolean;
  images = [
    'assets/images/vShop.jpg',
    'assets/images/business/business-1.jpg',
    'assets/images/business/business-2.jpg',
    'assets/images/business/business-3.jpg',
  ];

  ngOnInit(): void {
    this.image = this.images[Math.floor(Math.random() * this.images.length)];
  }

  formatFollowers(count: number): string {
    if (count == null || count < 0) return '0';
    if (count >= 1_000_000) {
      const value = count / 1_000_000;
      const display = value % 1 === 0 ? value : Math.floor(value * 10) / 10;
      return `${display} M`;
    }
    if (count >= 1_000) {
      const value = count / 1_000;
      const display = value % 1 === 0 ? value : Math.floor(value * 10) / 10;
      return `${display} m`;
    }
    return String(count);
  }
}
