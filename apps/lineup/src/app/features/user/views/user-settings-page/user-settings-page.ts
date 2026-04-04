import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthStore, ProvidersEnum } from '@lineup/core';
import {
  Button,
  UpdateEmailModal,
  UpdatePasswordModal,
  VerificationCodeModal,
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { take } from 'rxjs';

@Component({
  selector: 'app-user-settings-page',
  imports: [CommonModule, TranslateModule, Button],
  templateUrl: './user-settings-page.html',
  styleUrl: './user-settings-page.scss',
})
export class UserSettingsPage implements OnInit {
  email = '';

  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private readonly _authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);
  private _ref: DynamicDialogRef | undefined;

  ngOnInit(): void {
    const user = this._authStore.user();
    this.email =
      user?.email ? this._maskEmail(user.email) : '';
  }

  get canChangeEmail(): boolean {
    const user = this._authStore.user();
    return user != null && user.provider !== ProvidersEnum.GOOGLE;
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
      data: { type: 'user' as const },
      dismissableMask: true,
      modal: true,
      closable: true,
    });

    this._ref.onClose
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((success: boolean) => {
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

  changeEmail(): void {
    const verifyRef = this._dialogService.open(VerificationCodeModal, {
      header: this._translate.instant('verificationCodeModal.title'),
      width: '400px',
      style: { maxHeight: '80vh' },
      dismissableMask: true,
      modal: true,
      draggable: false,
      resizable: false,
      data: { type: 'user' as const },
    });

    verifyRef.onClose
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((verified: boolean) => {
        if (!verified) {
          return;
        }
        this._openUpdateEmailModal();
      });
  }

  private _openUpdateEmailModal(): void {
    const currentEmail = this._authStore.user()?.email ?? '';
    this._ref = this._dialogService.open(UpdateEmailModal, {
      header: this._translate.instant('general.changeEmail'),
      width: '480px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '90vw',
        '400px': '95vw',
      },
      data: { type: 'user' as const, currentEmail },
      dismissableMask: true,
      modal: true,
      closable: true,
    });

    this._ref.onClose
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((success: boolean) => {
        if (success) {
          const u = this._authStore.user();
          this.email = u?.email ? this._maskEmail(u.email) : '';
          this._messageService.add({
            severity: 'success',
            summary: this._translate.instant('general.success'),
            detail: this._translate.instant('toast.emailUpdated'),
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
