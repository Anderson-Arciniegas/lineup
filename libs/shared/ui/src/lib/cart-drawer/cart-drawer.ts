import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy } from '@angular/core';
import {
  AuthStore,
  buildCartWhatsappMessage,
  CartItemSchema,
  CartSchema,
  CartStore,
  FileThumbnailUrlPipe,
  formatCartItemVariationSummary,
  resolveCartWhatsappPhone,
  SocialNetworkPrivateService,
  ToastService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DrawerModule } from 'primeng/drawer';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';
import { Button } from '../button/button';

/**
 * Sidebar flotante derecho con carritos del usuario agrupados por negocio.
 */
@Component({
  selector: 'lib-cart-drawer',
  standalone: true,
  imports: [
    CommonModule,
    DrawerModule,
    TranslateModule,
    Button,
    FileThumbnailUrlPipe,
    ProgressSpinner,
  ],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
})
export class CartDrawer implements OnDestroy {
  readonly cartStore = inject(CartStore);
  private readonly _authStore = inject(AuthStore);
  private readonly _socialMediaService = inject(SocialNetworkPrivateService);
  private readonly _utils = inject(UtilsService);
  private readonly _translate = inject(TranslateService);
  private readonly _toast = inject(ToastService);
  private readonly _subscription = new Subscription();
  private readonly whatsappByBusiness = new Map<number, string | null>();

  constructor() {
    effect(() => {
      if (this.cartStore.drawerOpen() && this._authStore.isUserLoggedIn()) {
        this.cartStore.loadCarts();
      }
    });
  }

  get visible(): boolean {
    return this.cartStore.drawerOpen();
  }

  set visible(value: boolean) {
    this.cartStore.setDrawerOpen(value);
  }

  increaseQty(cartItemId: number, quantity: number): void {
    this.cartStore.updateItem({ cartItemId, quantity: quantity + 1 });
  }

  decreaseQty(cartItemId: number, quantity: number): void {
    if (quantity <= 1) {
      this.cartStore.removeItem({ cartItemId });
      return;
    }
    this.cartStore.updateItem({ cartItemId, quantity: quantity - 1 });
  }

  removeItem(cartItemId: number): void {
    this.cartStore.removeItem({ cartItemId });
  }

  variationSummary(item: CartItemSchema): string {
    return formatCartItemVariationSummary(item, (key) =>
      this._translate.instant(key),
    );
  }

  checkoutViaWhatsapp(cart: CartSchema): void {
    const businessId = cart.idBusiness;
    const cached = this.whatsappByBusiness.get(businessId);
    if (cached) {
      this.openWhatsapp(cart, cached);
      return;
    }
    if (cached === null) {
      this._toast.warn('cart.noWhatsapp');
      return;
    }
    this._subscription.add(
      this._socialMediaService.findByBusiness(businessId).subscribe({
        next: (networks) => {
          const phone = resolveCartWhatsappPhone(networks);
          this.whatsappByBusiness.set(businessId, phone);
          if (!phone) {
            this._toast.warn('cart.noWhatsapp');
            return;
          }
          this.openWhatsapp(cart, phone);
        },
        error: () => this._toast.error('errors.generic'),
      }),
    );
  }

  private openWhatsapp(cart: CartSchema, phone: string): void {
    const message = buildCartWhatsappMessage(
      cart,
      this._translate.instant('cart.whatsappIntro'),
      this._translate.instant('cart.total'),
      (key) => this._translate.instant(key),
    );
    const href = this._utils.formatWhatsappPhone(
      phone,
      encodeURIComponent(message),
    );
    globalThis.open(href, '_blank', 'noopener,noreferrer');
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
