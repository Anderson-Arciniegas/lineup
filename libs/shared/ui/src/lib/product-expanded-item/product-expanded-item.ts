import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  AuthStore,
  BcvOfficialRatesSchema,
  CurrencySchema,
  CurrencySymbolPipe,
  DiscountSchema,
  getFileThumbnailUrl,
  ProductPublicService,
  ProductSchema,
  RatesPrivateService,
  ReactionTypeEnum,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Skeleton } from 'primeng/skeleton';
import { Subscription } from 'rxjs';
import { Button } from '../button/button';
import { ShareModal } from '../share-modal/share-modal';

/**
 * Vista ampliada de producto (lista/PDF): imagen principal con nonce en URL, precio con BCV,
 * stock, like y compartir (ocultos en exportación PDF).
 */
@Component({
  selector: 'lib-product-expanded-item',
  imports: [
    CommonModule,
    Button,
    RouterModule,
    TranslateModule,
    ProgressSpinner,
  ],
  templateUrl: './product-expanded-item.html',
  styleUrl: './product-expanded-item.scss',
})
export class ProductExpandedItem
  implements AfterViewInit, OnChanges, OnDestroy, OnInit
{
  @Input() product: ProductSchema;
  @Input() reverse = false;
  /** Catálogo PDF: oculta acciones (like / compartir). */
  @Input() pdfExportAttempt = false;
  /** `src` de la imagen principal (nonce en URLs http(s), v. catalog-carousel). */
  expandedImageSrc = 'assets/images/products/headphones-min.webp';
  imageLoaded = false;
  hasLiked = false;

  ref: DynamicDialogRef | undefined;
  price: number;
  originalPrice: number;
  currency: CurrencySchema;
  rates: BcvOfficialRatesSchema;
  inStock: boolean;
  outOfStock: boolean;

  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _utilsService = inject(UtilsService);
  private readonly _authStore = inject(AuthStore);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _ratesService = inject(RatesPrivateService);

  private readonly _subscription = new Subscription();

  /** Establece la fuente de la imagen expandida desde el primer archivo del producto. */
  ngOnInit(): void {
    this.setExpandedImageSrc();
  }

  /** Al cambiar el `product`, recalcula la imagen mostrada. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.setExpandedImageSrc();
    }
  }

  /** Consulta like, estado de stock y tasas para el precio con descuento. */
  ngAfterViewInit(): void {
    this.hasLikedProduct();

    this.price = this.product.skus?.[0].price ?? null;
    this.originalPrice = this.product.skus?.[0].price ?? null;
    this.product.skus?.map((sku) => {
      if (
        sku.quantity === null ||
        sku.quantity === undefined ||
        sku.quantity > 0
      ) {
        this.inStock = true;
      }
    });

    if (this.inStock) {
      this.outOfStock = false;
    } else {
      this.outOfStock = true;
    }
    this.currency = this.product.skus?.[0]?.currency ?? null;
    this.getRates();
  }

  /** Cancela suscripciones a API de producto y tasas. */
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  /** Miniatura `md` con fallback local si no hay archivo. */
  private setExpandedImageSrc(): void {
    const fallback = 'assets/images/products/headphones-min.webp';
    const raw = getFileThumbnailUrl(
      this.product?.productFiles?.[0]?.file,
      'md',
    );
    if (!raw) {
      this.expandedImageSrc = fallback;
      return;
    }
    const withNonce = this.srcWithCrossOriginNonce(raw);
    this.expandedImageSrc = withNonce ?? fallback;
  }

  /** Añade query de bust de caché en URLs http(s) para capturas y CORS. */
  private srcWithCrossOriginNonce(url: string): string {
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    if (!/^https?:\/\//i.test(url)) {
      return url;
    }
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}t=${Date.now()}`;
  }

  /** Modal de compartir con URL canónica del producto. */
  share() {
    this.ref = this._dialogService.open(ShareModal, {
      header: this._translate.instant('general.share'),
      width: '500px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        url: `${window.location.origin}/${this.product.business.path}/${this.product.catalog.path}/${this.product.id}`,
      },
      modal: true,
      closable: true,
    });
  }

  /** Like del producto (usuarios consumidores). */
  likeProduct(): void {
    if (this.hasLiked || !this._authStore.isUserLoggedIn()) return;
    this.hasLiked = true;
    this._subscription.add(
      this._productPublicService.likeProduct(this.product.id).subscribe({
        next: () => {
          this.hasLiked = true;
        },
        error: (error) => {
          console.error(error);
          this.hasLiked = false;
        },
      }),
    );
  }

  /** Quita like del producto. */
  unlikeProduct(): void {
    if (!this.hasLiked || !this._authStore.isUserLoggedIn()) return;
    this.hasLiked = false;
    this._subscription.add(
      this._productPublicService.unlikeProduct(this.product.id).subscribe({
        next: () => {
          this.hasLiked = false;
        },
        error: (error) => {
          console.error(error);
          this.hasLiked = true;
        },
      }),
    );
  }

  /** Estado inicial de favorito desde API. */
  hasLikedProduct(): void {
    if (!this._authStore.isUserLoggedIn()) return;
    this.hasLiked =
      this.product.reactions?.some(
        (reaction) => reaction.type === ReactionTypeEnum.LIKE,
      ) ?? false;
  }

  /** Carga BCV y recalcula precio mostrado con descuento del producto. */
  getRates(): void {
    this._subscription.add(
      this._ratesService.findBcvOfficialRates().subscribe({
        next: (rates) => {
          this.rates = rates;
          this.price = this._utilsService.formatPriceWithDiscount(
            this.product.skus?.[0] ?? null,
            (this.product.discountProduct?.discount as DiscountSchema) ?? null,
            this.rates ?? null,
          );
          this.currency = this.product.skus?.[0]?.currency ?? null;
        },
      }),
    );
  }
}
