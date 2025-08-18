import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  gsap
} from "gsap";
import {
  ButtonModule
} from "primeng/button";
import {
  CardModule
} from 'primeng/card';
import {
  Button
} from '../button/button';

@Component({
    selector: 'lib-product-card',
    imports: [CommonModule, Button, CardModule, ButtonModule, RouterLink],
    templateUrl: './product-card.html',
    styleUrl: './product-card.scss',
})
export class ProductCard implements AfterViewInit, OnInit{
    @Input() index: number;
    @Input() width = 'w-65';
    @Input() height = 'h-100';
    image: string;
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
    constructor(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        @Inject(PLATFORM_ID) private platformId: object, // eslint-disable-line
    ) {}
    
    ngOnInit(): void {
      this.image = this.images[Math.floor(Math.random() * this.images.length)];
    }

    ngAfterViewInit(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        setTimeout(() => {
            const flipBox = document.getElementById(`product-flip-${this.index}`);
            const inner = flipBox.querySelector(".flip-inner");

            flipBox.addEventListener("mouseenter", () => {
                gsap.to(inner, {
                    rotateX: 180,
                    duration: 0.4,
                    ease: "power2.inOut"
                });
            });

            flipBox.addEventListener("mouseleave", () => {
                gsap.to(inner, {
                    rotateX: 0,
                    duration: 0.4,
                    ease: "power2.inOut"
                });
            });
        }, 100);
    }
}