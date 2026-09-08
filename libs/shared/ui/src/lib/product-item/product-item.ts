import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  AppConfigService,
  BcvOfficialRatesSchema,
  CurrencySchema,
  DiscountSchema,
  FileThumbnailUrlPipe,
  ProductPrivateService,
  ProductSchema,
  UtilsService,
} from '@lineup/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { PopoverModule } from 'primeng/popover';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Subscription, take } from 'rxjs';
import { Button } from '../button/button';
import { ConfirmationModal } from '../confirmation-modal/confirmation-modal';

/**
 * Tarjeta de producto para el panel: menú de acciones (ver público, inventario, editar, borrar),
 * precio con descuento según tasas BCV y evento al eliminar.
 */
@Component({
  selector: 'lib-product-item',
  imports: [
    CommonModule,
    Button,
    CardModule,
    ButtonModule,
    FileThumbnailUrlPipe,
    RouterLink,
    ProgressSpinnerModule,
    PopoverModule,
    MenuModule,
  ],
  templateUrl: './product-item.html',
  styleUrl: './product-item.scss',
})
export class ProductItem implements OnInit {
  @Input() product: ProductSchema;
  @Input() rates: BcvOfficialRatesSchema;
  @Output() productDeletionEvent = new EventEmitter<number>();
  ref: DynamicDialogRef | undefined;
  image: string;
  imageLoaded: boolean;
  url: string;
  editUrl: string;
  inventoryUrl: string;
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

  attemptDelete: boolean;
  items: MenuItem[] | undefined;
  price: number;
  originalPrice: number;
  currency: CurrencySchema;

  private _subscription = new Subscription();

  private readonly _dialogService = inject(DialogService);
  private _translate = inject(TranslateService);
  private _utils = inject(UtilsService);
  private readonly _productService = inject(ProductPrivateService);
  private readonly _messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    @Inject(PLATFORM_ID) private platformId: object, // eslint-disable-line
  ) {}

  /** True when the product has a resolvable image URL. */
  get hasProductImage(): boolean {
    return !!this.image;
  }

  /** Construye URLs de edición/inventario y menú contextual PrimeNG. */
  ngOnInit(): void {
    if (this.product) {
      this.image = this.product.productFiles?.[0]?.file?.url?.trim() || '';
      this.url = `/${AppConfigService.config.routes.dashboard}/${AppConfigService.config.routes.catalogs}/${this.product.catalog.path}/${this.product.id}`;
      this.editUrl = `/${AppConfigService.config.routes.dashboard}/${AppConfigService.config.routes.catalogs}/${this.product.catalog.path}/${this.product.id}/${AppConfigService.config.routes.edit}`;
      this.inventoryUrl = `/${AppConfigService.config.routes.dashboard}/${AppConfigService.config.routes.catalogs}/${this.product.catalog.path}/${this.product.id}/${AppConfigService.config.routes.inventory}`;
      this.price = this._utils.formatPriceWithDiscount(
        this.product.skus?.[0] ?? null,
        (this.product.discountProduct?.discount as DiscountSchema) ?? null,
        this.rates ?? null,
      );
      this.originalPrice = this.product.skus?.[0]?.price ?? null;
      this.currency = this.product.skus?.[0]?.currency ?? null;
    }
    this.items = [
      {
        label: this._translate.instant('general.viewProduct'),
        icon: 'pi pi-external-link',
        command: () => {
          const url = `/${this.product.business.path}/${this.product.catalog.path}/${this.product.id}`;
          window.open(url, '_blank');
        },
      },
      {
        label: this._translate.instant('general.inventory'),
        icon: 'pi pi-warehouse',
        command: () => {
          this._utils.navigate([this.inventoryUrl]);
        },
      },
      {
        label: this._translate.instant('general.edit'),
        icon: 'pi pi-pencil',
        command: () => {
          this._utils.navigate([this.editUrl]);
        },
      },
      {
        label: this._translate.instant('general.delete'),
        icon: 'pi pi-trash',
        command: () => {
          this.deleteProduct();
        },
      },
    ];
  }

  /** Abre confirmación y, si acepta, llama a `removeProduct` y emite `productDeletionEvent`. */
  deleteProduct(): void {
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
          'confirmation.areYouSureYouWantToDeleteThisProduct',
        ),
        color: 'danger',
      },
      modal: true,
      draggable: false,
      resizable: false,
    });

    this.ref.onClose
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          const id = this.product.id;
          if (this.attemptDelete) return;
          this.attemptDelete = true;
          this._subscription.add(
            this._productService.removeProduct(id).subscribe({
              next: () => {
                this.attemptDelete = false;
                this._messageService.add({
                  severity: 'success',
                  summary: this._translate.instant('general.success'),
                  detail: this._translate.instant(
                    'toast.productDeletedSuccessfully',
                  ),
                  life: 3000,
                });
                this.productDeletionEvent.emit(id);
              },
              error: (error) => {
                console.error(error);
                this.attemptDelete = false;
              },
            }),
          );
        }
      });
  }

  /** Trunca título para vistas de lista en el panel. */
  setLabel(title: string | null | undefined, maxLength = 20): string {
    const t = title ?? '';
    return t.length > maxLength ? t.substring(0, maxLength) + '...' : t;
  }
}
