import {
    CommonModule,
    isPlatformBrowser
} from '@angular/common';

import {
    AfterViewInit,
    Component,
    inject,
    Inject,
    OnInit,
    PLATFORM_ID
} from '@angular/core';
import { BusinessesService, CreateBusinessInput } from '@libs/graphql';
import { RolesCodesEnum } from '@lineup/core';
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
    private platformId = inject(PLATFORM_ID);
    responsiveOptions: any[] | undefined;

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

    ngOnInit() {
        this.responsiveOptions = [
            {
                breakpoint: '1536px',
                numVisible: 4,
                numScroll: 1
            },
            {
                breakpoint: '1280px',
                numVisible: 4,
                numScroll: 1
            },
            {
                breakpoint: '1024px',
                numVisible: 3,
                numScroll: 1
            },
            {
                breakpoint: '768px',
                numVisible: 2,
                numScroll: 1
            },
            {
                breakpoint: '640px',
                numVisible: 1,
                numScroll: 1
            }
        ]
    }

    ngAfterViewInit() {
        if (!isPlatformBrowser(this.platformId)) return;
    }
}