import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  AuthStore,
  BusinessSchema,
  CurrencySymbolPipe,
  DiscountPrivateService,
  DiscountSchema,
  DiscountScopeEnum,
  DiscountTypeEnum,
  UtilsService,
} from '@lineup/core';
import { LocaleDatePipe } from '@lineup/core';
import { Button, ConfirmationModal, ProductBreadcrumb } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-discount-page',
  imports: [
    CommonModule,
    TranslateModule,
    LocaleDatePipe,
    ProgressSpinner,
    Button,
    ProductBreadcrumb,
    CurrencySymbolPipe,
  ],
  templateUrl: './discount-page.html',
  styleUrl: './discount-page.scss',
})
export class DiscountPage implements OnInit, OnDestroy {
  private readonly _route = inject(ActivatedRoute);
  private readonly _discountService = inject(DiscountPrivateService);
  private readonly _utils = inject(UtilsService);
  private readonly _authStore = inject(AuthStore);
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);
  private readonly _dialogService = inject(DialogService);
  private readonly _subscriptions = new Subscription();

  business: BusinessSchema | undefined;
  discount: DiscountSchema | null = null;
  loading = false;
  errorMessage: string | null = null;

  readonly DiscountScopeEnum = DiscountScopeEnum;
  readonly DiscountTypeEnum = DiscountTypeEnum;

  private _deleteRef?: DynamicDialogRef;

  ngOnInit(): void {
    this.business = this._authStore.business();
    const raw = this._route.snapshot.paramMap.get('idDiscount');
    const id = raw != null ? Number.parseInt(raw, 10) : Number.NaN;
    if (Number.isNaN(id)) {
      this.errorMessage = this._translate.instant('general.errorLoadingData');
      return;
    }
    this.loadDiscount(id);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  scopeLabelKey(scope: DiscountScopeEnum): string {
    switch (scope) {
      case DiscountScopeEnum.BUSINESS:
        return 'general.discountScopeBusiness';
      case DiscountScopeEnum.CATALOG:
        return 'general.discountScopeCatalog';
      case DiscountScopeEnum.PRODUCT:
        return 'general.discountScopeProduct';
      default:
        return 'general.discountScope';
    }
  }

  typeLabelKey(discountType: DiscountTypeEnum): string {
    return discountType === DiscountTypeEnum.PERCENTAGE
      ? 'general.discountTypePercentage'
      : 'general.discountTypeFixed';
  }

  onEdit(): void {
    if (!this.discount) return;
    this._utils.navigate([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.discounts,
      this.discount.id,
      AppConfigService.config.routes.edit,
    ]);
  }

  onDelete(): void {
    if (!this.discount) return;

    this._deleteRef = this._dialogService.open(ConfirmationModal, {
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

    this._subscriptions.add(
      this._deleteRef.onClose.subscribe((confirmed: boolean) => {
        if (!confirmed || !this.discount) return;

        const idDiscount = this.discount.id;
        this._subscriptions.add(
          this._discountService.removeDiscount(idDiscount).subscribe({
            next: () => {
              this._messageService.add({
                severity: 'success',
                summary: this._translate.instant('general.success'),
                detail: this._translate.instant('general.discountDeleted'),
                life: 3000,
              });
              this._utils.navigate([
                AppConfigService.config.routes.dashboard,
                AppConfigService.config.routes.discounts,
              ]);
            },
            error: (error: unknown) => {
              console.error(error);
              this._messageService.add({
                severity: 'error',
                summary: this._translate.instant('general.error'),
                detail: this._translate.instant(
                  'general.errorDeletingDiscount',
                ),
                life: 4000,
              });
            },
          }),
        );
      }),
    );
  }

  cancel(): void {
    this._utils.navigate([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.discounts,
    ]);
  }

  private loadDiscount(id: number): void {
    this.loading = true;
    this.errorMessage = null;
    this.discount = null;

    this._subscriptions.add(
      this._discountService.findOneDiscount(id).subscribe({
        next: (d) => {
          console.log(d);
          this.discount = d;
          this.loading = false;
        },
        error: (error: unknown) => {
          console.error(error);
          this.loading = false;
          this.errorMessage = this._translate.instant(
            'general.errorLoadingData',
          );
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail: this._translate.instant('general.errorLoadingData'),
            life: 4000,
          });
        },
      }),
    );
  }
}
