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
} from '@lineup/core';
import {
  ProductBreadcrumb,
  ProductCard,
  ProductInfo
} from '@lineup/ui';
import {
  Carousel
} from "primeng/carousel";
import {
  SkeletonModule
} from 'primeng/skeleton';

@Component({
    selector: 'app-product-page',
    imports: [
        CommonModule,
        SkeletonModule,
        ProductBreadcrumb,
        ProductInfo,
        ProductCard,
        Carousel
    ],
    templateUrl: './product-page.html',
    styleUrl: './product-page.scss',
})
export class ProductPage implements OnInit {
    business = {
        name: 'Tu Punto vShop',
        image: 'assets/images/vShop.jpg'
    };
    product: Product | undefined;
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

    responsiveOptions: any[] | undefined;

    ngOnInit() {
        this.responsiveOptions = [{
                breakpoint: '1400px',
                numVisible: 3,
                numScroll: 1
            },
            {
                breakpoint: '1199px',
                numVisible: 2,
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

        this.product = generateRandomProducts(1)[0];
        console.log(this.product);
    }


    onPage($event) {
        console.log('Page changed to: ', $event.page);
    }

}