import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogSchema, FileThumbnailUrlPipe } from '@lineup/core';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Button } from '../button/button';

@Component({
  selector: 'lib-catalog-card',
  imports: [
    CommonModule,
    CardModule,
    FileThumbnailUrlPipe,
    RouterLink,
    ProgressSpinnerModule,
    Button,
  ],
  templateUrl: './catalog-card.html',
  styleUrl: './catalog-card.scss',
})
export class CatalogCard implements OnInit {
  @Input() width = 'w-72';
  @Input() height = 'h-96';
  @Input() editMode: boolean;
  @Input() catalog: CatalogSchema;
  @Input() dashboardMode: boolean;
  image: string;
  imageLoaded: boolean;
  images: string[] = [
    'assets/images/products/headphones-min.webp',
    'assets/images/products/makeup.webp',
    'assets/images/products/shoes-min.webp',
    'assets/images/products/phone-min.webp',
    'assets/images/products/skincare-min.webp',
    'assets/images/products/tomato-min.webp',
    'assets/images/products/camera.webp',
    'assets/images/products/cooler.webp',
    'assets/images/products/laptop.webp',
  ];

  ngOnInit(): void {
    if (!this.catalog?.image) {
      this.image = this.images[Math.floor(Math.random() * this.images.length)];
    }
  }
}
