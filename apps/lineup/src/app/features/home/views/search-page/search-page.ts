import {
    CommonModule
} from '@angular/common';

import {
    Component,
    OnInit
} from '@angular/core';
import {
    BusinessCard,
    Button,
    CatalogCard,
    ProductCard,
    SearchFilters,
    Ui
} from "@lineup/ui";
import { TranslateModule } from '@ngx-translate/core';
// import gsap from 'gsap';
// import ScrollTrigger from 'gsap/ScrollTrigger';
import {
    ButtonModule
} from 'primeng/button';
import {
    Carousel
} from 'primeng/carousel';
import { DialogModule } from 'primeng/dialog';
import {
    IconField
} from "primeng/iconfield";
import {
    InputIcon
} from "primeng/inputicon";
import {
    Tag
} from 'primeng/tag';
  
@Component({
    selector: 'app-search-page',
    imports: [CommonModule, Ui, Button, InputIcon, IconField, BusinessCard, ProductCard, CatalogCard, Carousel, ButtonModule, Tag, SearchFilters, DialogModule, TranslateModule],
    templateUrl: './search-page.html',
    styleUrl: './search-page.scss',
})
export class SearchPage implements OnInit {
    visible: boolean;
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

    ngOnInit(): void {
        window.addEventListener('scroll', function() {
            const searchBar = document.querySelector('.search');
            const filters = document.querySelector('.filters-container');

            if (window.scrollY > 100) {
                searchBar.classList.add('shrink');
            } else {
                searchBar.classList.remove('shrink');
            }

            if (window.scrollY > 280) {
                filters.classList.add('filters-shrink');
            } else {
                filters.classList.remove('filters-shrink');
            }
        });
    }

    showDialog() {
        this.visible = true;
    }
}