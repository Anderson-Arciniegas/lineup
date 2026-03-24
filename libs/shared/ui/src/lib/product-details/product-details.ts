import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  AuthStore,
  BASIC_COLORS,
  BASIC_SIZES,
  CurrencySchema,
  ProductPublicService,
  ProductSchema,
  ProductSkuSchema,
  SocialNetworkPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SocialNetworkBusinessSchema } from 'libs/shared/core/src/lib/schemas/social-network-business.schema';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { Subscription } from 'rxjs';
import { Button } from '../button/button';
import { ProductVariations } from '../product-variations/product-variations';
import { ShareModal } from '../share-modal/share-modal';

@Component({
  selector: 'lib-product-details',
  imports: [
    CommonModule,
    Button,
    PanelModule,
    MenuModule,
    ProductVariations,
    TranslateModule,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
  providers: [MessageService],
})
export class ProductDetails implements OnChanges {
  @Input() product: ProductSchema;
  businessSocialNetworks: SocialNetworkBusinessSchema[] = [];
  /**
   * Estado local de la selección del usuario para cada variación.
   * Clave: `product.variations[].title` (ej: 'variations.color', 'variations.size').
   */
  private selectedOptionsByVariationTitle: Record<string, string> = {};
  private isInitializingFromUrl = false;
  /** Evita doble inicialización en hidratación (SSR → cliente): solo init cuando cambia el id del producto. */
  private lastInitializedProductId: number | null = null;
  attempt: boolean;
  ref: DynamicDialogRef | undefined;
  hasLiked = false;
  href: string;
  price: number;
  currency: CurrencySchema;
  outOfStock: boolean;
  private readonly _socialMediaService = inject(SocialNetworkPrivateService);
  private readonly _messageService = inject(MessageService);
  private readonly _utilsService = inject(UtilsService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _subscription = new Subscription();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      const productId = this.product.id;
      // Solo resetear e inicializar cuando cambia el producto (evita doble carga en SSR → hidratación).
      if (this.lastInitializedProductId !== productId) {
        this.lastInitializedProductId = productId;
        this.selectedOptionsByVariationTitle = {};
        this.initializeSelectionFromUrl();
      }
    }

    if (this.product) {
      this.getSocialNetworkBusinesses();
      this.hasLikedProduct();

      this.price = this.product.skus?.[0]?.price ?? null;
      this.currency = this.product.skus?.[0]?.currency ?? null;
    }
  }

  onVariationOptionChange(variationTitle: string, option: string): void {
    this.selectedOptionsByVariationTitle[variationTitle] = option;
    if (!this.isInitializingFromUrl) {
      this.syncUrlFromSelection();
    }
  }

  getSelectedOption(variationTitle: string): string | null {
    return this.selectedOptionsByVariationTitle[variationTitle] ?? null;
  }

  /** Variaciones sin duplicar por título para no mostrar dos bloques iguales. */
  get productVariationsUnique(): ProductSchema['variations'] {
    const variations = this.product?.variations ?? [];
    const seen = new Set<string>();
    return variations.filter((v) => {
      if (seen.has(v.title)) return false;
      seen.add(v.title);
      return true;
    });
  }

  private initializeSelectionFromUrl(): void {
    const product = this.product;
    const variations = product?.variations ?? [];
    const skus = product?.skus ?? [];
    if (!variations.length) return;

    this.isInitializingFromUrl = true;

    // Defaults: primera opción de cada variación.
    const defaults: Record<string, string | null> = {};
    for (const variation of variations) {
      defaults[variation.title] = variation.options?.[0] ?? null;
      const defaultValue = defaults[variation.title];
      if (defaultValue != null) this.selectedOptionsByVariationTitle[variation.title] = defaultValue;
    }

    const queryParamMap = this._activatedRoute.snapshot.queryParamMap;
    const skuParam = queryParamMap.get('sku');

    // Si existe `sku`, tiene prioridad absoluta.
    if (skuParam != null) {
      const skuId = Number(skuParam);
      if (Number.isFinite(skuId)) {
        const matchedSku = skus.find((sku) => sku.id === skuId);
        if (matchedSku) {
          for (const variation of variations) {
            const allowedOptions = variation.options ?? [];
            const selected =
              this.getSkuOptionForVariation(
                matchedSku,
                variation.title,
                allowedOptions,
              ) ?? null;

            if (selected != null) {
              this.selectedOptionsByVariationTitle[variation.title] = selected;
            } else {
              const fallback = defaults[variation.title];
              if (fallback != null) {
                this.selectedOptionsByVariationTitle[variation.title] = fallback;
              }
            }
          }
        }
      }

      // Si `sku` no existe o no se encuentra, se mantiene el default.
      this.isInitializingFromUrl = false;
      return;
    }

    // Si no hay `sku`, leemos los query params de opciones.
    for (const variation of variations) {
      const key = this.getVariationQueryParamKey(variation.title);
      const rawValue = queryParamMap.get(key);

      const allowedOptions = variation.options ?? [];
      const valid =
        rawValue != null &&
        allowedOptions.includes(rawValue) &&
        rawValue.trim().length > 0;

      if (valid) {
        if (rawValue != null) {
          this.selectedOptionsByVariationTitle[variation.title] = rawValue;
        }
      }
    }

    this.isInitializingFromUrl = false;
  }

  private getVariationQueryParamKey(variationTitle: string): string {
    if (variationTitle === 'variations.color') return 'color';
    if (variationTitle === 'variations.size') return 'size';

    const normalized = variationTitle
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();

    return normalized ? `var_${normalized}` : 'var';
  }

  private getSkuOptionForVariation(
    sku: ProductSkuSchema,
    variationTitle: string,
    allowedOptions: string[],
  ): string | null {
    const variationOptions = sku.variationOptions ?? {};

    // Caso 1: la key existe con el mismo nombre de la variación.
    const direct = (variationOptions as Record<string, unknown>)[variationTitle];
    if (direct != null) {
      const directStr = String(direct);
      if (allowedOptions.includes(directStr)) return directStr;
    }

    // Caso 2: keys comunes para variaciones predefinidas.
    const commonKey =
      variationTitle === 'variations.color'
        ? 'color'
        : variationTitle === 'variations.size'
          ? 'size'
          : null;
    if (commonKey) {
      const val = (variationOptions as Record<string, unknown>)[commonKey];
      if (val != null) {
        const valStr = String(val);
        if (allowedOptions.includes(valStr)) return valStr;
      }
    }

    // Caso 3: matching por tipo (color/talla) usando enums básicos.
    if (variationTitle === 'variations.color') {
      for (const value of Object.values(variationOptions)) {
        if (value == null) continue;
        const valueStr = String(value);
        const isColor = BASIC_COLORS.some((c) => c.value === valueStr);
        if (isColor && allowedOptions.includes(valueStr)) return valueStr;
      }
    }

    if (variationTitle === 'variations.size') {
      for (const value of Object.values(variationOptions)) {
        if (value == null) continue;
        const valueStr = String(value);
        const isSize = BASIC_SIZES.some((s) => s.value === valueStr);
        if (isSize && allowedOptions.includes(valueStr)) return valueStr;
      }
    }

    // Caso 4: fallback general: cualquier valor dentro de los allowedOptions.
    for (const value of Object.values(variationOptions)) {
      if (value == null) continue;
      const valueStr = String(value);
      if (allowedOptions.includes(valueStr)) {
        return valueStr;
      }
    }

    return null;
  }

  private syncUrlFromSelection(): void {
    const product = this.product;
    const variations = product?.variations ?? [];
    if (!variations.length) return;

    const currentParams: Record<string, string> = {
      ...(this._activatedRoute.snapshot.queryParams ?? {}),
    } as Record<string, string>;

    // Eliminar sku cuando el usuario ajusta opciones manualmente.
    delete currentParams['sku'];

    // Eliminar keys antiguos de variaciones gestionadas por este componente.
    for (const variation of variations) {
      const key = this.getVariationQueryParamKey(variation.title);
      delete currentParams[key];
    }

    // Escribir los valores seleccionados.
    for (const variation of variations) {
      const key = this.getVariationQueryParamKey(variation.title);
      const selected = this.selectedOptionsByVariationTitle[variation.title];
      if (selected != null && selected.trim().length > 0) {
        currentParams[key] = selected;
      }
    }

    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: currentParams,
      replaceUrl: true,
    });
  }

  get skuAvailabilityMessage(): string | null {
    const variations = this.product?.variations ?? [];
    if (!variations.length) return null;
    if (!this.product?.skus?.length) return null;

    const selectedValues = variations
      .map((v) => this.selectedOptionsByVariationTitle[v.title])
      .filter((v): v is string => typeof v === 'string' && v.length > 0);

    // Hasta que el usuario no haya seleccionado una opción en todas las variaciones
    // no mostramos disponibilidad.
    if (selectedValues.length !== variations.length) return null;

    const skus = this.product.skus ?? [];
    const matchedSku = skus.find((sku) => {
      const skuValues = Object.values(sku.variationOptions ?? {})
        .filter(
          (v): v is string | number =>
            v != null && (typeof v === 'string' || typeof v === 'number'),
        )
        .map((v) => String(v));

      if (skuValues.length !== selectedValues.length) return false;
      return selectedValues.every((selected) => skuValues.includes(selected));
    }) as ProductSkuSchema | undefined;

    if (!matchedSku) return null;

    // En runtime puede venir `quantity` como `null` aunque el tipo del modelo
    // lo declare como `number`.
    const rawQuantity: unknown = (
      matchedSku as unknown as { quantity?: unknown }
    )?.quantity;
    if (rawQuantity == null) return null;

    const quantity =
      typeof rawQuantity === 'number' ? rawQuantity : Number(rawQuantity);
    if (!Number.isFinite(quantity)) return null;

    if (quantity === 0) {
      this.outOfStock = true;
      return this._translate.instant('general.outOfStock', {
        quantity,
      });
    }
    this.outOfStock = false;
    if (quantity === 1) {
      return this._translate.instant('general.lastAvailable', {
        quantity,
      });
    }

    if (quantity > 0 && quantity < 5) {
      return this._translate.instant('general.fewLeft', {
        quantity,
      });
    }
    return this._translate.instant('general.inStock', { quantity });
  }

  getSocialNetworkUrl(id: number) {
    const socialNetwork = this.businessSocialNetworks.find(
      (socialNetwork) => Number(socialNetwork.socialNetwork.id) === Number(id),
    );
    return socialNetwork
      ? socialNetwork.url
        ? socialNetwork.url
        : socialNetwork.phone
      : '';
  }

  getSocialNetworkBusinesses() {
    this.attempt = true;
    this._subscription.add(
      this._socialMediaService
        .findByBusiness(this.product.business.id)
        .subscribe({
          next: (socialNetworkBusinesses) => {
            console.log(socialNetworkBusinesses);
            if (socialNetworkBusinesses.length > 0) {
              this.businessSocialNetworks = socialNetworkBusinesses;
              if (
                this.businessSocialNetworks &&
                this.businessSocialNetworks.find(
                  (socialNetwork) => socialNetwork.phone,
                )
              ) {
                const phone = this.businessSocialNetworks
                  .find((socialNetwork) => socialNetwork.phone)
                  .phone.trim();
                console.log(phone);
                this.href = this._utilsService.formatWhatsappPhone(
                  phone,
                  `Hola%20estoy%20interesado%20en%20este%20producto:%20${location.href}`,
                );
              }
            } else {
              this.businessSocialNetworks = [];
            }
            this.attempt = false;
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
          complete: () => {
            console.log('Social network businesses fetched');
          },
        }),
    );
  }

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
        url: location.href,
      },
      modal: true,
      closable: true,
    });
  }

  likeProduct(): void {
    if (this.hasLiked || this._authStore.isBusinessLoggedIn()) return;
    this.hasLiked = true;
    this._subscription.add(
      this._productPublicService.likeProduct(this.product.id).subscribe({
        next: (response) => {
          console.log(response);
          this.hasLiked = true;
        },
        error: (error) => {
          console.error(error);
          this.hasLiked = false;
        },
        complete: () => {
          console.log('Product liked');
        },
      }),
    );
  }

  unlikeProduct(): void {
    if (!this.hasLiked || this._authStore.isBusinessLoggedIn()) return;
    this.hasLiked = false;
    this._subscription.add(
      this._productPublicService.unlikeProduct(this.product.id).subscribe({
        next: (response) => {
          console.log(response);
          this.hasLiked = false;
        },
        error: (error) => {
          console.error(error);
          this.hasLiked = true;
        },
        complete: () => {
          console.log('Product unliked');
        },
      }),
    );
  }

  hasLikedProduct(): void {
    if (this._authStore.isBusinessLoggedIn()) return;
    this._subscription.add(
      this._productPublicService.hasLikedProduct(this.product.id).subscribe({
        next: (response) => {
          console.log(response);
          this.hasLiked = response;
        },
      }),
    );
  }
}
