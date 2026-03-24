import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  BusinessPrivateService,
  BusinessSchema,
  CatalogPrivateService,
  CatalogSchema,
  ProductPrivateService,
  ProductSchema,
  UserPublicService,
  VisitTypeEnum,
} from '@lineup/core';
import {
  Button,
  CatalogCarousel,
  CreateProductCard,
  ProductBreadcrumb,
  ProductCard,
  SearchBar,
} from '@lineup/ui';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-catalog-page',
  imports: [
    CommonModule,
    ProductBreadcrumb,
    ProductCard,
    Button,
    IconField,
    InputIcon,
    CatalogCarousel,
    CreateProductCard,
    ProgressSpinner,
    SearchBar,
    InfiniteScrollDirective,
  ],
  templateUrl: 'catalog-page.html',
  styleUrls: ['./catalog-page.scss'],
})
export class CatalogPage implements OnInit {
  business: BusinessSchema;
  catalog: CatalogSchema;
  bgColor: string | undefined;
  path: string;
  catalogPath: string;
  products: ProductSchema[] = [];
  attempt = false;
  productsAttempt = false;
  page = 1;
  noMoreResults = false;
  myBusiness = false;
  searchQuery = '';

  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _businessService = inject(BusinessPrivateService);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _userService = inject(UserPublicService);

  private _subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.path = this._activatedRoute.snapshot.params['business'];
    this.catalogPath = this._activatedRoute.snapshot.params['catalogPath'];
    this.getBusiness();
    this.getCatalog();
  }

  private getBusiness(): void {
    this._subscription.add(
      this._businessService.getBusinessByPath(this.path).subscribe({
        next: (business) => {
          this.business = business;
          this.myBusiness =
            Number(this._authStore.business()?.id) === Number(this.business.id);
        },
      }),
    );
  }

  onSearchSubmit(query: string): void {
    console.log(query);
    this.searchQuery = query;
    this.products = [];
    this.page = 1;
    this.noMoreResults = false;
    this.getProducts();
  }

  private getCatalog(): void {
    if (this.attempt) return;
    this.attempt = true;
    this._subscription.add(
      this._catalogService.findOneCatalogByPath(this.catalogPath).subscribe({
        next: (catalog) => {
          this.catalog = catalog;
          this.attempt = false;
          console.log(this.catalog);
          this.getProducts();
          if (!this.myBusiness) {
            this.visitCatalog();
          }
        },
        error: (error) => {
          console.error(error);
          this.attempt = false;
        },
        complete: () => {
          console.log('complete');
          this.attempt = false;
        },
      }),
    );
  }

  private visitCatalog(): void {
    this._subscription.add(
      this._userService
        .recordVisit({
          id: this.catalog.id,
          type: VisitTypeEnum.CATALOG,
        })
        .subscribe({
          next: (response) => {
            console.log(response);
          },
        }),
    );
  }

  getProducts(): void {
    if (!isPlatformBrowser(this._platformId)) return;
    if (this.productsAttempt || this.noMoreResults) return;
    this.productsAttempt = true;
    this._subscription.add(
      this._productService
        .getAllByCatalog(this.catalog.id, {
          page: this.page,
          limit: 20,
          search: this.searchQuery,
        })
        .subscribe({
          next: (products) => {
            console.log(products);
            this.productsAttempt = false;
            this.products = [...this.products, ...products.items];
            this.page++;
            if (products.items.length === 0) {
              this.noMoreResults = true;
            }
          },
          error: (error) => {
            console.error(error);
            this.productsAttempt = false;
          },
          complete: () => {
            console.log('complete');
            this.productsAttempt = false;
          },
        }),
    );
  }

  setColor($event: string) {
    const color1 = $event;
    const color2 = 'rgba(255, 255, 255, 0.5)'; // Color de fondo

    this.bgColor = `linear-gradient(to bottom, ${color1}, ${color2})`;
  }

  onScroll(): void {
    console.log('onScroll');
    this.getProducts();
  }
}
