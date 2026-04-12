import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthStore,
  BASIC_COLORS,
  BASIC_SIZES,
  BcvOfficialRatesSchema,
  CurrencySchema,
  DiscountSchema,
  DiscountSchemaFields,
  DiscountTypeEnum,
  ProductPublicService,
  ProductSchema,
  ProductSkuSchema,
  RatesPrivateService,
  SocialNetworkPrivateService,
  StatusEnum,
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

/**
 * Bloque de ficha pública: variaciones con sincronización a query params y `sku`,
 * precios con descuentos y conversión BCV, like/compartir, redes y enlace WhatsApp con mensaje enriquecido.
 */
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
  href = '';
  /** Teléfono WhatsApp del negocio; el mensaje y la URL se arman al vuelo. */
  private whatsappPhone: string | null = null;
  outOfStock: boolean;
  rates: BcvOfficialRatesSchema;
  private readonly _socialMediaService = inject(SocialNetworkPrivateService);
  private readonly _messageService = inject(MessageService);
  private readonly _utilsService = inject(UtilsService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _ratesService = inject(RatesPrivateService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _subscription = new Subscription();

  /**
   * Al cambiar de producto reinicia selección, query params y datos auxiliares;
   * en cada versión válida recarga redes, like y tasas.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      const productId = this.product.id;
      // Solo resetear e inicializar cuando cambia el producto (evita doble carga en SSR → hidratación).
      if (this.lastInitializedProductId !== productId) {
        this.lastInitializedProductId = productId;
        this.selectedOptionsByVariationTitle = {};
        this.whatsappPhone = null;
        this.href = '';
        this.initializeSelectionFromUrl();
      }
    }

    if (this.product) {
      this.getSocialNetworkBusinesses();
      this.hasLikedProduct();
      this.getRates();
    }
  }

  /**
   * Precio de venta según el SKU que encaja con las variaciones elegidas (o el primero por defecto).
   * Si hay descuento vigente usa `UtilsService.formatPriceWithDiscount` con tasas BCV.
   */
  get price(): number | null {
    return this.getEffectivePriceDetails()?.salePrice ?? null;
  }

  /** Precio de lista del SKU sin descuento; se muestra tachado cuando `showDiscountUi` es true. */
  get originalListPrice(): number | null {
    const d = this.getEffectivePriceDetails();
    return d?.showDiscount ? d.listPrice : null;
  }

  /** Mostrar precio original tachado junto al precio promocional. */
  get showDiscountUi(): boolean {
    return this.getEffectivePriceDetails()?.showDiscount ?? false;
  }

  /** Calcula precio final, precio lista y si debe mostrarse el tachado (oferta real). */
  private getEffectivePriceDetails(): {
    salePrice: number;
    listPrice: number;
    showDiscount: boolean;
  } | null {
    const sku = this.getSkuForPricing();
    if (sku == null || sku.price == null) return null;
    const listPrice = sku.price;
    const discount = this.getProductDiscount();
    if (!this.isDiscountActiveNow(discount)) {
      return { salePrice: listPrice, listPrice, showDiscount: false };
    }
    const needsRatesForFixed =
      discount.discountType === DiscountTypeEnum.FIXED &&
      sku.idCurrency !== discount.idCurrency;
    if (needsRatesForFixed && !this.rates) {
      return { salePrice: listPrice, listPrice, showDiscount: false };
    }
    const computed = this._utilsService.formatPriceWithDiscount(
      sku,
      discount as DiscountSchema,
      this.rates ?? ({ dollar: 1, euro: 1 } as BcvOfficialRatesSchema),
    );
    const salePrice = computed ?? listPrice;
    const showDiscount = salePrice < listPrice;
    return { salePrice, listPrice, showDiscount };
  }

  get currency(): CurrencySchema | null {
    const sku = this.getSkuForPricing();
    return sku?.currency ?? null;
  }

  /** Factor Bs por 1 USD o 1 EUR según moneda del SKU; `null` si no aplica o faltan tasas. */
  private getBsRateForSkuCurrency(): number | null {
    const sku = this.getSkuForPricing();
    if (!this.rates || sku?.idCurrency == null) return null;
    if (sku.idCurrency === 2) return null;
    if (sku.idCurrency === 1) return this.rates.dollar;
    if (sku.idCurrency === 3) return this.rates.euro;
    return null;
  }

  /** Equivalente en bolívares del precio de venta cuando la moneda del SKU es USD/EUR. */
  get equivalentBsSalePrice(): number | null {
    const p = this.price;
    const factor = this.getBsRateForSkuCurrency();
    if (p == null || factor == null) return null;
    return p * factor;
  }

  /** Equivalente en Bs del precio de lista tachado, solo si hay descuento visible. */
  get equivalentBsOriginalPrice(): number | null {
    if (!this.showDiscountUi) return null;
    const p = this.originalListPrice;
    const factor = this.getBsRateForSkuCurrency();
    if (p == null || factor == null) return null;
    return p * factor;
  }

  private getProductDiscount(): DiscountSchemaFields | undefined {
    const dp = this.product?.discountProduct as
      | { discount?: DiscountSchemaFields }
      | undefined;
    return dp?.discount;
  }

  private isDiscountActiveNow(
    discount: DiscountSchemaFields | undefined,
  ): discount is DiscountSchemaFields {
    return !!discount && discount.status === StatusEnum.ACTIVE;
  }

  /** SKU cuyas opciones coinciden con todas las variaciones seleccionadas, si existe. */
  private findResolvedSkuForVariations(): ProductSkuSchema | undefined {
    const product = this.product;
    if (!product?.skus?.length) return undefined;
    const variations = product.variations ?? [];
    if (!variations.length) return undefined;

    const selectedValues = variations
      .map((v) => this.selectedOptionsByVariationTitle[v.title])
      .filter((v): v is string => typeof v === 'string' && v.length > 0);

    if (selectedValues.length !== variations.length) return undefined;

    const skus = product.skus;
    return skus.find((sku) => {
      const skuValues = Object.values(sku.variationOptions ?? {})
        .filter(
          (v): v is string | number =>
            v != null && (typeof v === 'string' || typeof v === 'number'),
        )
        .map((v) => String(v));
      if (skuValues.length !== selectedValues.length) return false;
      return selectedValues.every((selected) => skuValues.includes(selected));
    });
  }

  /** SKU usado para precios: el resuelto por variaciones o, si no hay, el primero del producto. */
  private getSkuForPricing(): ProductSkuSchema | null {
    const product = this.product;
    if (!product?.skus?.length) return null;
    const skus = product.skus;
    const variations = product.variations ?? [];

    if (!variations.length) {
      return skus[0] ?? null;
    }

    const resolved = this.findResolvedSkuForVariations();
    return resolved ?? skus[0] ?? null;
  }

  onVariationOptionChange(variationTitle: string, option: string): void {
    this.selectedOptionsByVariationTitle[variationTitle] = option;
    if (!this.isInitializingFromUrl) {
      this.syncUrlFromSelection();
    }
    this.syncWhatsappHref();
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
      if (defaultValue != null)
        this.selectedOptionsByVariationTitle[variation.title] = defaultValue;
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
                this.selectedOptionsByVariationTitle[variation.title] =
                  fallback;
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
    const direct = (variationOptions as Record<string, unknown>)[
      variationTitle
    ];
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

    const matchedSku = this.findResolvedSkuForVariations();
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
            if (socialNetworkBusinesses.length > 0) {
              this.businessSocialNetworks = socialNetworkBusinesses;
              const withPhone = this.businessSocialNetworks.find((sn) =>
                sn.phone?.trim(),
              );
              this.whatsappPhone = withPhone?.phone?.trim() ?? null;
            } else {
              this.businessSocialNetworks = [];
              this.whatsappPhone = null;
            }
            this.syncWhatsappHref();
            this.attempt = false;
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
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

  unlikeProduct(): void {
    if (!this.hasLiked || this._authStore.isBusinessLoggedIn()) return;
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

  hasLikedProduct(): void {
    if (this._authStore.isBusinessLoggedIn()) return;
    this._subscription.add(
      this._productPublicService.hasLikedProduct(this.product.id).subscribe({
        next: (response) => {
          this.hasLiked = response;
        },
      }),
    );
  }

  /** Arma el cuerpo del mensaje de WhatsApp: intro i18n, producto, variaciones, precio y URL. */
  private buildWhatsappContactMessage(): string {
    const intro = this._translate.instant('general.whatsappContactIntro');
    const title = (this.product?.title ?? '').trim();
    const variationParts = this.buildWhatsappVariationSummaryParts();
    const varSuffix =
      variationParts.length > 0 ? ` (${variationParts.join(', ')})` : '';
    const amount = this.price;
    const currencyCode = this.currency?.code ?? 'USD';
    let priceStr: string;
    if (amount != null) {
      try {
        priceStr = new Intl.NumberFormat('es', {
          style: 'currency',
          currency: currencyCode,
          currencyDisplay: 'symbol',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch {
        priceStr = `${amount} ${currencyCode}`;
      }
    } else {
      priceStr = this._translate.instant('general.noPrice');
    }
    const bullet = `- ${title}${varSuffix} - ${priceStr}`;
    const url =
      typeof globalThis !== 'undefined' &&
      'location' in globalThis &&
      globalThis.location?.href
        ? globalThis.location.href
        : '';
    return `${intro}\n\n${bullet}\n\n${url}`.trim();
  }

  /**
   * Misma lógica que `ProductVariations.getOptionLabel`: valores tipo `black` → claves i18n (`colors.black`).
   */
  private resolveVariationOptionLabel(option: string): string {
    const trimmed = String(option ?? '').trim();
    if (!trimmed) return '';
    const colorMeta = BASIC_COLORS.find((c) => c.value === trimmed);
    if (colorMeta) {
      return this._translate.instant(colorMeta.name);
    }
    const sizeMeta = BASIC_SIZES.find((s) => s.value === trimmed);
    if (sizeMeta) {
      return this._translate.instant(sizeMeta.name);
    }
    return this._translate.instant(trimmed);
  }

  /** Partes de texto para el resumen de variaciones en el mensaje de WhatsApp. */
  private buildWhatsappVariationSummaryParts(): string[] {
    const parts: string[] = [];
    for (const v of this.productVariationsUnique) {
      const sel = this.selectedOptionsByVariationTitle[v.title];
      if (!sel) continue;
      const titleT = this._translate.instant(v.title);
      const selT = this.resolveVariationOptionLabel(sel);
      parts.push(`${titleT} ${selT}`.replace(/\s+/g, ' ').trim());
    }
    return parts;
  }

  private syncWhatsappHref(): void {
    if (!this.whatsappPhone) {
      this.href = '';
      return;
    }
    const message = this.buildWhatsappContactMessage();
    this.href = this._utilsService.formatWhatsappPhone(
      this.whatsappPhone,
      encodeURIComponent(message),
    );
  }

  private getRates(): void {
    this._subscription.add(
      this._ratesService.findBcvOfficialRates().subscribe({
        next: (rates) => {
          this.rates = rates;
          this.syncWhatsappHref();
        },
        error: (error) => {
          console.error(error);
        },
      }),
    );
  }
}
