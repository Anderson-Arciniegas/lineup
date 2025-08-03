import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, PLATFORM_ID, QueryList, ViewChildren } from '@angular/core';
import { gsap } from 'gsap';
@Component({
  selector: 'lib-product-carousel',
  imports: [CommonModule],
  templateUrl: './product-carousel.html',
  styleUrl: './product-carousel.scss',
})
export class ProductCarousel implements AfterViewInit {
  images = ['https://picsum.photos/800/800', 'https://picsum.photos/800/800', 'https://picsum.photos/800/800', 'https://picsum.photos/800/800', 'https://picsum.photos/800/800', 'https://picsum.photos/800/800', 'https://picsum.photos/800/800', 'https://picsum.photos/800/800'];
 
  @ViewChildren('carouselItem', { read: ElementRef })
  itemRefs!: QueryList<ElementRef>;

  offset = 0;
  radius = 200;
  centerX = 300;
  centerY = 250;
  
  constructor(
        @Inject(PLATFORM_ID) private platformId: object, // eslint-disable-line
  ) {}

  ngAfterViewInit() {
    this.positionItems();
  }

  positionItems() {
    if (!isPlatformBrowser(this.platformId)) return;
    const items = document.querySelectorAll('.carousel-item');
    const total = items.length;

    items.forEach((item, i) => {
      const angle = ((i / (total - 1)) * Math.PI) - Math.PI / 2 + this.offset;
      const x = this.centerX + this.radius * Math.cos(angle);
      const y = this.centerY + this.radius * Math.sin(angle);

      gsap.to(item, {
        duration: 0.6,
        x: x - item.clientWidth / 2,
        y: y - item.clientHeight / 2,
        scale: 1,
        zIndex: Math.floor(1000 + y)
      });
    });
  }

  rotateLeft() {
    this.offset -= Math.PI / this.images.length;
    this.positionItems();
  }

  rotateRight() {
    this.offset += Math.PI / this.images.length;
    this.positionItems();
  }
}
