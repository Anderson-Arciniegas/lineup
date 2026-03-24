import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthStore, BusinessSchema, ProvidersEnum } from '@lineup/core';
import {
  Button,
  UpdateEmailModal,
  UpdatePasswordModal,
  VerificationCodeModal,
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-business-settings-page',
  imports: [CommonModule, TranslateModule, Button],
  templateUrl: './business-settings-page.html',
  styleUrl: './business-settings-page.scss',
})
export class BusinessSettingsPage implements OnInit {
  business: BusinessSchema;
  email: string;
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private readonly _authStore = inject(AuthStore);
  private _ref: DynamicDialogRef | undefined;

  ngOnInit(): void {
    this.business = this._authStore.business();

    this.email =
      this.business && this.business.email
        ? this._maskEmail(this.business.email)
        : '';
  }

  get canChangeEmail(): boolean {
    return (
      this.business != null &&
      this.business.provider !== ProvidersEnum.GOOGLE
    );
  }

  changeEmail(): void {
    const verifyRef = this._dialogService.open(VerificationCodeModal, {
      header: this._translate.instant('verificationCodeModal.title'),
      width: '400px',
      style: { maxHeight: '80vh' },
      dismissableMask: true,
      modal: true,
      draggable: false,
      resizable: false,
      data: { type: 'business' as const },
    });

    verifyRef.onClose.subscribe((verified: boolean) => {
      if (!verified) {
        return;
      }
      this._openUpdateEmailModal();
    });
  }

  private _openUpdateEmailModal(): void {
    const currentEmail = this.business?.email ?? '';
    this._ref = this._dialogService.open(UpdateEmailModal, {
      header: this._translate.instant('general.changeEmail'),
      width: '480px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '90vw',
        '400px': '95vw',
      },
      data: { type: 'business' as const, currentEmail },
      dismissableMask: true,
      modal: true,
      closable: true,
    });

    this._ref.onClose.subscribe((success: boolean) => {
      if (success) {
        this.business = this._authStore.business();
        this.email = this.business?.email
          ? this._maskEmail(this.business.email)
          : '';
        this._messageService.add({
          severity: 'success',
          summary: this._translate.instant('general.success'),
          detail: this._translate.instant('toast.emailUpdated'),
          life: 3000,
        });
      }
    });
  }

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

  private _maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) {
      return email;
    }

    const visibleChars = Math.min(3, localPart.length);
    const visiblePart = localPart.slice(0, visibleChars);
    const hiddenLength = Math.max(localPart.length - visibleChars, 0);
    const hiddenPart = hiddenLength > 0 ? '*'.repeat(hiddenLength) : '';

    return `${visiblePart}${hiddenPart}@${domain}`;
  }
}
