import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  PLATFORM_ID
} from '@angular/core';
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
    imports: [CommonModule, Button, CardModule, ButtonModule],
    templateUrl: './product-card.html',
    styleUrl: './product-card.scss',
})
export class ProductCard implements AfterViewInit {
    @Input() index: number;
    @Input() width = 'w-65';
    @Input() height = 'h-100';

    constructor(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        @Inject(PLATFORM_ID) private platformId: object, // eslint-disable-line
    ) {}

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