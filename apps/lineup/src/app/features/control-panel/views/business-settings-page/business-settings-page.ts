import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Button, UpdatePasswordModal } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-business-settings-page',
  imports: [CommonModule, TranslateModule, Button],
  templateUrl: './business-settings-page.html',
  styleUrl: './business-settings-page.scss',
})
export class BusinessSettingsPage {
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private _ref: DynamicDialogRef | undefined;

  changePassword(): void {
    this._ref = this._dialogService.open(UpdatePasswordModal, {
      header: this._translate.instant('general.changePassword'),
      width: '480px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '90vw',
        '400px': '95vw',
      },
      data: { type: 'business' as const },
      dismissableMask: true,
      modal: true,
      closable: true,
    });

    this._ref.onClose.subscribe((success: boolean) => {
      if (success) {
        this._messageService.add({
          severity: 'success',
          summary: this._translate.instant('general.success'),
          detail: this._translate.instant('toast.passwordUpdated'),
          life: 3000,
        });
      }
    });
  }
}
