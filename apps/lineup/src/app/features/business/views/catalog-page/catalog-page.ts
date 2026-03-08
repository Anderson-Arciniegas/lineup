import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  BusinessSchema,
  BusinessService,
  CatalogSchema,
  CatalogService,
  ProductSchema,
  ProductService,
  UserService,
  VisitTypeEnum,
} from '@lineup/core';
import {
  Button,
  CatalogCarousel,
  CreateProductCard,
  ProductBreadcrumb,
  ProductCard,
} from '@lineup/ui';
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
  ],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage implements OnInit {
  business: BusinessSchema;
  catalog: CatalogSchema;
  bgColor: string | undefined;
  path: string;
  catalogPath: string;
  products: ProductSchema[] = [];
  attempt = false;
  page = 1;
  noMoreResults = false;
  myBusiness = false;
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _businessService = inject(BusinessService);
  private readonly _catalogService = inject(CatalogService);
  private readonly _productService = inject(ProductService);
  private readonly _authStore = inject(AuthStore);
  private readonly _userService = inject(UserService);

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
    if (isPlatformBrowser(this._platformId)) {
      this._subscription.add(
        this._productService
          .getAllByCatalog(this.catalog.id, {
            page: this.page,
            limit: 100,
          })
          .subscribe({
            next: (products) => {
              console.log(products);

              this.products = [...this.products, ...products.items];
              this.page++;
              if (products.items.length === 0) {
                this.noMoreResults = true;
              }
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
  }

  setColor($event: string) {
    const color1 = $event;
    const color2 = 'rgba(255, 255, 255, 0.5)'; // Color de fondo

    this.bgColor = `linear-gradient(to bottom, ${color1}, ${color2})`;
  }
}
