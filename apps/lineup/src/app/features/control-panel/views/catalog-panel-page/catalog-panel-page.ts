import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  BcvOfficialRatesSchema,
  BusinessPrivateService,
  BusinessSchema,
  CatalogPrivateService,
  CatalogSchema,
  ProductPrivateService,
  ProductSchema,
  RatesPrivateService,
  UtilsService,
} from '@lineup/core';
import {
  Button,
  CatalogCarousel,
  ConfirmationModal,
  CreateProductCard,
  ProductBreadcrumb,
  ProductCard,
  ProductItem,
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MessageService } from 'primeng/api';
import { ChipModule } from 'primeng/chip';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-catalog-panel-page',
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
    TranslateModule,
    ChipModule,
    ProductItem,
    InfiniteScrollDirective,
  ],
  templateUrl: './catalog-panel-page.html',
  styleUrl: './catalog-panel-page.scss',
})
export class CatalogPanelPage implements OnInit {
  business: BusinessSchema;
  catalog: CatalogSchema;
  bgColor: string | undefined;
  path: string;
  catalogPath: string;
  products: ProductSchema[] = [];
  attempt = false;
  deleteAttempt = false;
  page = 1;
  noMoreResults = false;
  productsAttempt = false;
  rates: BcvOfficialRatesSchema;
  ref: DynamicDialogRef | undefined;
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _businessService = inject(BusinessPrivateService);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _ratesService = inject(RatesPrivateService);
  private readonly _utils = inject(UtilsService);
  private _subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.path = this._activatedRoute.snapshot.params['business'];
    this.catalogPath = this._activatedRoute.snapshot.params['catalogPath'];
    if (this.path) {
      this.getBusiness();
    }
    this.getCatalog();
    this.getRates();
  }

  getBusiness(): void {
    this._subscription.add(
      this._businessService.getBusinessByPath(this.path).subscribe({
        next: (business) => {
          this.business = business;
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

  getCatalog(): void {
    this.attempt = true;
    this._subscription.add(
      this._catalogService.findOneCatalogByPath(this.catalogPath).subscribe({
        next: (catalog) => {
          this.catalog = catalog;
          this.getProducts();
          this.attempt = false;
        },
        error: (error) => {
          console.error(error);
          this.attempt = false;
        },
        complete: () => {
          console.log('complete');
        },
      }),
    );
  }

  onScroll(): void {
    console.log('onScroll');
    this.getProducts();
  }

  getProducts(): void {
    if (this.productsAttempt || this.noMoreResults) return;
    this.productsAttempt = true;
    this._subscription.add(
      this._productService
        .getAllByCatalogPaginated(this.catalog.id, {
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
            this.productsAttempt = false;
          },
          error: (error) => {
            console.error(error);
            this.productsAttempt = false;
          },
          complete: () => {
            console.log('complete');
          },
        }),
    );
  }

  deleteCatalog(): void {
    this.ref = this._dialogService.open(ConfirmationModal, {
      width: '500px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        message: this._translate.instant(
          'confirmation.areYouSureYouWantToDeleteThisCatalog',
        ),
        color: 'danger',
      },
      // dismissableMask: true,
      modal: true,
      draggable: false,
      resizable: false,
      // closable: true,
    });

    this.ref.onClose.subscribe((confirmed: boolean) => {
      if (confirmed) {
        if (this.deleteAttempt) return;
        this.deleteAttempt = true;
        this._subscription.add(
          this._catalogService.removeCatalog(this.catalog.id).subscribe({
            next: (response) => {
              console.log(response);
              this.deleteAttempt = false;
              this._messageService.add({
                severity: 'success',
                summary: this._translate.instant('general.success'),
                detail: this._translate.instant(
                  'toast.catalogDeletedSuccessfully',
                ),
                life: 3000,
              });
              this._utils.navigate([
                AppConfigService.config.routes.dashboard,
                AppConfigService.config.routes.catalogs,
              ]);
            },
            error: (error) => {
              console.error(error);
              this.deleteAttempt = false;
            },
            complete: () => {
              console.log('Catalog deleted');
            },
          }),
        );
      }
    });
  }

  deleteProduct(id: number): void {
    console.log(id);
    this.products = this.products.filter((product) => product.id !== id);
  }

  getRates(): void {
    this._subscription.add(
      this._ratesService.findBcvOfficialRates().subscribe({
        next: (rates) => {
          this.rates = rates;
        },
        error: (error) => {
          console.error(error);
        },
      }),
    );
  }
}
