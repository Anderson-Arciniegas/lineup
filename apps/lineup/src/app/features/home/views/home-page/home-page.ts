import { CommonModule, isPlatformBrowser } from '@angular/common';

import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  BusinessCard,
  Button,
  CatalogCard,
  ProductCard,
  SearchBar,
} from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
// import gsap from 'gsap';
// import ScrollTrigger from 'gsap/ScrollTrigger';
import { FormsModule } from '@angular/forms';
import {
  AppConfigService,
  BusinessPublicService,
  BusinessSchema,
  CatalogPublicService,
  CatalogSchema,
  ProductCollectionSchema,
  ProductPublicService,
  ProductSchema,
  TagSchema,
  UtilsService,
} from '@lineup/core';
import { ButtonModule } from 'primeng/button';
import { Carousel } from 'primeng/carousel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Subscription } from 'rxjs';

// gsap.registerPlugin(ScrollTrigger);
@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    Button,
    InputIcon,
    IconField,
    BusinessCard,
    ProductCard,
    CatalogCard,
    Carousel,
    ButtonModule,
    TranslateModule,
    FormsModule,
    SearchBar,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  responsiveOptions: any[] | undefined;
  productCollectionResponsiveOptions: any[] | undefined;
  tags: TagSchema[] = [];

  products: ProductSchema[] = [];
  catalogs: CatalogSchema[] = [];
  businesses: BusinessSchema[] = [];
  productCollections: ProductCollectionSchema[] = [];
  private readonly _businessPublicService = inject(BusinessPublicService);
  private readonly _catalogPublicService = inject(CatalogPublicService);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _utils = inject(UtilsService);
  private readonly _subscription = new Subscription();

  ngOnInit() {
    this.productCollectionResponsiveOptions = [
      {
        breakpoint: '1920px',
        numVisible: 5,
        numScroll: 1,
      },
      {
        breakpoint: '1536px',
        numVisible: 4,
        numScroll: 1,
      },
      {
        breakpoint: '1280px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '1024px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '640px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '550px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
    this.responsiveOptions = [
      {
        breakpoint: '1920px',
        numVisible: 5,
        numScroll: 1,
      },
      {
        breakpoint: '1536px',
        numVisible: 4,
        numScroll: 1,
      },
      {
        breakpoint: '1280px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '1024px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '640px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '500px',
        numVisible: 1,
        numScroll: 1,
      },
    ];

    this.getFeaturedBusinesses();
    this.getFeaturedCatalogs();
    this.getFeaturedProducts();
    this.getProductCollections();
    this.getMainTags();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
  }

  private getFeaturedBusinesses(): void {
    this._subscription.add(
      this._businessPublicService
        .featuredBusinesses({ page: 1, limit: 10 })
        .subscribe({
          next: (response) => {
            console.log(response);
            this.businesses = [...this.businesses, ...response.items];
          },
          error: (error) => {
            console.error(error);
          },
          complete: () => {
            console.log('complete');
          },
        }),
    );
  }

  private getFeaturedCatalogs(): void {
    this._subscription.add(
      this._catalogPublicService
        .featuredCatalogs({ page: 1, limit: 10 })
        .subscribe({
          next: (response) => {
            console.log(response);
            this.catalogs = [...this.catalogs, ...response.items];
          },
          error: (error) => {
            console.error(error);
          },
          complete: () => {
            console.log('complete');
          },
        }),
    );
  }

  private getFeaturedProducts(): void {
    this._subscription.add(
      this._productPublicService
        .featuredProducts({ page: 1, limit: 10 })
        .subscribe({
          next: (response) => {
            console.log(response);
            this.products = [...this.products, ...response.items];
          },
          error: (error) => {
            console.error(error);
          },
          complete: () => {
            console.log('complete');
          },
        }),
    );
  }

  private getProductCollections(): void {
    this._subscription.add(
      this._productPublicService.productCollections().subscribe({
        next: (response) => {
          this.productCollections = [...this.productCollections, ...response];
          console.log(this.productCollections);
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          console.log('complete');
        },
      }),
    );
  }

  private getMainTags(): void {
    this._subscription.add(
      this._productPublicService.getMainTags(8).subscribe({
        next: (response) => {
          console.log(response);
          this.tags = response;
        },
      }),
    );
  }

  onSearchSubmit(query: string): void {
    if (query === '') return;

    this._utils.navigate([AppConfigService.config.routes.search, query]);
  }
}
