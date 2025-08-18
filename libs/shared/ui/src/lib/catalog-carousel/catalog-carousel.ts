import {
  CommonModule
} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output
} from '@angular/core';
import {
  generateRandomProducts,
  Product
} from '@lineup/core'; // Ajusta @your-org según tu scope
import { FastAverageColor } from 'fast-average-color';
import {
  Carousel
} from 'primeng/carousel';
import {
  ImageModule
} from 'primeng/image';
import {
  BusinessCard
} from "../business-card/business-card";
import { Button } from "../button/button";
import { CatalogCarouselItem } from "../catalog-carousel-item/catalog-carousel-item";
import {
  ProductCard
} from "../product-card/product-card";

@Component({
    selector: 'lib-catalog-carousel',
    imports: [CommonModule, Carousel, BusinessCard, ProductCard, ImageModule, Button, CatalogCarouselItem],
    templateUrl: './catalog-carousel.html',
    styleUrl: './catalog-carousel.scss',
})
export class CatalogCarousel implements OnInit, AfterViewInit {
    @Output() setColor = new EventEmitter<string>();
    responsiveOptions: any[] | undefined;

    products: Product[] = [];
    bgColor: string | undefined;
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
    
    private _cdr = inject(ChangeDetectorRef);
    
    ngOnInit() {
        this.responsiveOptions = [{
                breakpoint: '1400px',
                numVisible: 1,
                numScroll: 1
            },
            {
                breakpoint: '1199px',
                numVisible: 1,
                numScroll: 1
            },
            {
                breakpoint: '767px',
                numVisible: 1,
                numScroll: 1
            },
            {
                breakpoint: '575px',
                numVisible: 1,
                numScroll: 1
            }
        ]

        this.products = generateRandomProducts(10);
        
        
        this.products.forEach((product, index) => {

          product.image = this.images[index % this.images.length];
        });
        console.log(this.products);
    }
    
    ngAfterViewInit(): void {
       this.onPage({
            page: 0
        });
    }

    onPage($event: any) {
        const img = document.getElementById(this.products[$event.page].id) as HTMLImageElement;
        const fac = new FastAverageColor();
        fac.getColorAsync(img).then(color => {
            const rgba = color.rgba.replace(/[\d.]+\)$/g, '0.5)');
            this.bgColor = rgba;
            this.setColor.emit(this.bgColor);
            this._cdr.detectChanges();
        });
    }
}