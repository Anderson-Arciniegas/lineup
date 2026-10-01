import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
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
import { Button, ConfirmationModal } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

/**
 * Página de carritos del usuario: un carrito por negocio, con edición y contacto WhatsApp (RF44).
 */
@Component({
  selector: 'app-carts-page',
  imports: [
    CommonModule,
    TranslateModule,
    Button,
    RouterLink,
    FileThumbnailUrlPipe,
    ProgressSpinner,
  ],
  templateUrl: './carts-page.html',
  styleUrl: './carts-page.scss',
  providers: [DialogService],
})
export class CartsPage implements OnInit, OnDestroy {
  readonly cartStore = inject(CartStore);
  private readonly _socialMediaService = inject(SocialNetworkPrivateService);
  private readonly _utils = inject(UtilsService);
  private readonly _translate = inject(TranslateService);
  private readonly _toast = inject(ToastService);
  private readonly _dialogService = inject(DialogService);
  private readonly _subscription = new Subscription();
  private readonly whatsappByBusiness = new Map<number, string | null>();
  private confirmRef: DynamicDialogRef | undefined;

  ngOnInit(): void {
    this.cartStore.loadCarts();
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

  confirmClearCart(cart: CartSchema): void {
    this.confirmRef = this._dialogService.open(ConfirmationModal, {
      header: this._translate.instant('cart.deleteCartTitle'),
      width: '420px',
      modal: true,
      closable: true,
      data: {
        message: this._translate.instant('cart.deleteCartConfirm', {
          business: cart.business?.name ?? '',
        }),
        color: 'danger',
      },
    });
    this._subscription.add(
      this.confirmRef.onClose.subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.cartStore.clearCart(cart.idBusiness);
        }
      }),
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

  businessPath(cart: CartSchema): string | null {
    const path = cart.business?.path?.trim();
    return path ? `/${path}` : null;
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
    this.confirmRef?.close();
    this._subscription.unsubscribe();
  }
}
