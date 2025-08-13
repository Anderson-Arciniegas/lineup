import {
  CommonModule
} from '@angular/common';
import {
  Component,
  OnInit
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
import {
  ProductCard
} from "../product-card/product-card";

@Component({
    selector: 'lib-catalog-carousel',
    imports: [CommonModule, Carousel, BusinessCard, ProductCard, ImageModule],
    templateUrl: './catalog-carousel.html',
    styleUrl: './catalog-carousel.scss',
})
export class CatalogCarousel implements OnInit {
    responsiveOptions: any[] | undefined;

    products: Product[] = [];
    bgColor: string | undefined;
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

        this.products = generateRandomProducts(50);
        console.log(this.products);
    }

    onPage($event: any) {
        console.log('Page changed', $event);
        const img = document.getElementById(this.products[$event.page].id) as HTMLImageElement;
        const fac = new FastAverageColor();
        fac.getColorAsync(img).then(color => {
            this.bgColor = color.rgba; // color.rgba -> 'rgba(r, g, b, a)'
            console.log(this.bgColor)
        });
      
    }
}