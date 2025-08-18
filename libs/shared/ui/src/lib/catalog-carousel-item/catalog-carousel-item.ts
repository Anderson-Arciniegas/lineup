import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Product } from '@lineup/core';
import { Skeleton } from "primeng/skeleton";
import { Button } from "../button/button";

@Component({
  selector: 'lib-catalog-carousel-item',
  imports: [CommonModule, Button, Skeleton],
  templateUrl: './catalog-carousel-item.html',
  styleUrl: './catalog-carousel-item.scss',
})
export class CatalogCarouselItem {
  @Input() product: Product | undefined;
  imageLoaded = false;
}
