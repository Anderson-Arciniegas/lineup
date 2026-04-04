import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AppConfigService,
  DiscountPrivateService,
  DiscountSchema,
  DiscountScopeEnum,
  StatusEnum,
  UtilsService,
} from '@lineup/core';
import { Button, ConfirmationModal, DiscountItem } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { forkJoin, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-discounts-panel-page',
  imports: [
    CommonModule,
    TranslateModule,
    ProgressSpinner,
    Button,
    DiscountItem,
  ],
  templateUrl: './discounts-panel-page.html',
  styleUrl: './discounts-panel-page.scss',
})
export class DiscountsPanelPage implements OnInit, OnDestroy {
  private readonly _discountService = inject(DiscountPrivateService);
  private readonly _dialogService = inject(DialogService);
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);
  private readonly _utils = inject(UtilsService);

  discounts: DiscountSchema[] = [];
  loading = false;

  private readonly _subscriptions = new Subscription();
  private readonly destroyRef = inject(DestroyRef);
  private _deleteRef: DynamicDialogRef | undefined;

  ngOnInit(): void {
    this.loadDiscounts();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private loadDiscounts(): void {
    if (this.loading) return;
    this.loading = true;

    const reqs = [
      this._discountService.findAllMyDiscountsByScope(
        { scope: DiscountScopeEnum.BUSINESS },
        { page: 1, limit: 50 },
      ),
      this._discountService.findAllMyDiscountsByScope(
        { scope: DiscountScopeEnum.CATALOG },
        { page: 1, limit: 50 },
      ),
      this._discountService.findAllMyDiscountsByScope(
        { scope: DiscountScopeEnum.PRODUCT },
        { page: 1, limit: 50 },
      ),
    ];

    this._subscriptions.add(
      forkJoin(reqs).subscribe({
        next: (responses) => {
          const byId = new Map<number, DiscountSchema>();

          for (const response of responses) {
            for (const discount of response.items ?? []) {
              if (discount.status !== StatusEnum.ACTIVE) continue;
              byId.set(discount.id, discount);
            }
          }

          this.discounts = Array.from(byId.values()).sort((a, b) => {
            const aTime = new Date(a.endDate).getTime();
            const bTime = new Date(b.endDate).getTime();
            return aTime - bTime;
          });
        },
        error: (error) => {
          console.error(error);
          this._messageService.add({
            severity: 'error',
            summary: this._translate.instant('general.error'),
            detail: this._translate.instant('general.errorLoadingData'),
            life: 4000,
          });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      }),
    );
  }

  onCreateDiscount(): void {
    this._utils.navigate([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.discounts,
      AppConfigService.config.routes.create,
    ]);
  }

  onEditDiscount(discount: DiscountSchema): void {
    this._utils.navigate([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.discounts,
      discount.id,
      AppConfigService.config.routes.edit,
    ]);
  }

  onDeleteDiscount(idDiscount: number): void {
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
      this._deleteRef.onClose
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe((confirmed: boolean) => {
          if (!confirmed) return;

          this._subscriptions.add(
            this._discountService.removeDiscount(idDiscount).subscribe({
              next: () => {
                this.discounts = this.discounts.filter(
                  (d) => d.id !== idDiscount,
                );
                this._messageService.add({
                  severity: 'success',
                  summary: this._translate.instant('general.success'),
                  detail: 'Descuento eliminado correctamente.',
                  life: 3000,
                });
              },
              error: (error) => {
                console.error(error);
                this._messageService.add({
                  severity: 'error',
                  summary: this._translate.instant('general.error'),
                  detail: 'No se pudo eliminar el descuento.',
                  life: 4000,
                });
              },
            }),
          );
        }),
    );
  }
}
