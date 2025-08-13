import {
    CommonModule,
    isPlatformBrowser
} from '@angular/common';

import {
    AfterViewInit,
    Component,
    ElementRef,
    Inject,
    OnInit,
    PLATFORM_ID,
    ViewChild
} from '@angular/core';
import {
    BusinessCard,
    Button,
    CatalogCard,
    ProductCard,
    Ui
} from "@lineup/ui";
// import gsap from 'gsap';
// import ScrollTrigger from 'gsap/ScrollTrigger';
import {
    ButtonModule
} from 'primeng/button';
import {
    Carousel
} from 'primeng/carousel';
import {
    IconField
} from "primeng/iconfield";
import {
    InputIcon
} from "primeng/inputicon";
import {
    Tag
} from 'primeng/tag';
// gsap.registerPlugin(ScrollTrigger);
@Component({
    selector: 'app-home-page',
    imports: [CommonModule, Ui, Button, InputIcon, IconField, BusinessCard, ProductCard, CatalogCard, Carousel, ButtonModule, Tag],
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
})
export class HomePage implements OnInit, AfterViewInit {
    responsiveOptions: any[] | undefined;
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    products: any[] | undefined = [{
            id: 1,
            name: 'Product 1',
            image: 'product1.jpg',
            price: 100,
            inventoryStatus: 'in-stock'
        },
        {
            id: 2,
            name: 'Product 2',
            image: 'product2.jpg',
            price: 200,
            inventoryStatus: 'out-of-stock'
        },
        {
            id: 3,
            name: 'Product 3',
            image: 'product3.jpg',
            price: 300,
            inventoryStatus: 'low-stock'
        },
        {
            id: 4,
            name: 'Product 1',
            image: 'product1.jpg',
            price: 100,
            inventoryStatus: 'in-stock'
        },
        {
            id: 5,
            name: 'Product 2',
            image: 'product2.jpg',
            price: 200,
            inventoryStatus: 'out-of-stock'
        },
        {
            id: 6,
            name: 'Product 3',
            image: 'product3.jpg',
            price: 300,
            inventoryStatus: 'low-stock'
        },
        {
            id: 7,
            name: 'Product 1',
            image: 'product1.jpg',
            price: 100,
            inventoryStatus: 'in-stock'
        },
        {
            id: 8,
            name: 'Product 2',
            image: 'product2.jpg',
            price: 200,
            inventoryStatus: 'out-of-stock'
        },
        {
            id: 9,
            name: 'Product 3',
            image: 'product3.jpg',
            price: 300,
            inventoryStatus: 'low-stock'
        }

    ];

    constructor(
        @Inject(PLATFORM_ID) private platformId: object, // eslint-disable-line
    ) {}

    ngOnInit() {
        this.responsiveOptions = [{
                breakpoint: '1400px',
                numVisible: 4,
                numScroll: 1
            },
            {
                breakpoint: '1199px',
                numVisible: 3,
                numScroll: 1
            },
            {
                breakpoint: '767px',
                numVisible: 2,
                numScroll: 1
            },
            {
                breakpoint: '575px',
                numVisible: 1,
                numScroll: 1
            }
        ]
    }

    ngAfterViewInit() {
        if (!isPlatformBrowser(this.platformId)) return;
      
    }
}