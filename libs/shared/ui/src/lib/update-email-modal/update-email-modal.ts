import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AuthStore,
  BusinessPrivateService,
  BusinessSchema,
  UserPublicService,
  UserSchema,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { take } from 'rxjs';
import { Button } from '../button/button';
import { VerificationCodeModal } from '../verification-code-modal/verification-code-modal';

export type UpdateEmailModalType = 'user' | 'business';

export interface UpdateEmailModalData {
  type: UpdateEmailModalType;
  /** Correo actual (sin enmascarar) para precargar el campo y validar que haya cambio */
  currentEmail: string;
}

/**
 * Actualización de correo: valida que sea distinto al actual, abre verificación por código
 * y persiste el nuevo email en usuario o negocio.
 */
@Component({
  selector: 'lib-update-email-modal',
  imports: [
    CommonModule,
    DialogModule,
    ReactiveFormsModule,
    TranslateModule,
    Button,
    FloatLabel,
    InputTextModule,
  ],
  templateUrl: './update-email-modal.html',
  styleUrl: './update-email-modal.scss',
})
export class UpdateEmailModal implements OnInit {
  form: FormGroup;
  attempt = false;
  modalType: UpdateEmailModalType = 'user';
  private initialEmail = '';

  private readonly _fb = inject(FormBuilder);
  private readonly _ref = inject(DynamicDialogRef);
  private readonly _config = inject(DynamicDialogConfig);
  private readonly _dialogService = inject(DialogService);
  private readonly _userService = inject(UserPublicService);
  private readonly _businessService = inject(BusinessPrivateService);
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);
  private readonly _authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const data = this._config.data as UpdateEmailModalData | undefined;
    this.modalType = data?.type ?? 'user';
    this.initialEmail = (data?.currentEmail ?? '').trim();
    this.form = this._fb.group({
      email: [this.initialEmail, [Validators.required, Validators.email]],
    });
  }

  get emailControl(): AbstractControl | null {
    return this.form.get('email');
  }

  cancel(): void {
    this._ref.close(false);
  }

  proceedToVerification(): void {
    if (this.form.invalid || this.attempt) {
      this.form.markAllAsTouched();
      return;
    }
    const newEmail = (this.emailControl?.value as string).trim();
    if (
      this._normalizeEmail(newEmail) ===
      this._normalizeEmail(this.initialEmail)
    ) {
      this._messageService.add({
        severity: 'warn',
        summary: this._translate.instant('general.warning'),
        detail: this._translate.instant('validation.emailUnchanged'),
        life: 4000,
      });
      return;
    }

    const verifyRef = this._dialogService.open(VerificationCodeModal, {
      header: this._translate.instant('verificationCodeModal.title'),
      width: '400px',
      style: { maxHeight: '80vh' },
      dismissableMask: true,
      modal: true,
      draggable: false,
      resizable: false,
      data: {
        type: this.modalType,
        email: newEmail,
      },
    });

    verifyRef.onClose
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((verified: boolean) => {
        if (!verified) {
          return;
        }
        this._updateEmail(newEmail);
      });
  }

  private _normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private _updateEmail(newEmail: string): void {
    this.attempt = true;
    const onError = (err: unknown): void => {
      this.attempt = false;
      this._messageService.add({
        severity: 'error',
        summary: this._translate.instant('general.error'),
        detail:
          (err as { graphQLErrors?: Array<{ message?: string }> })
            ?.graphQLErrors?.[0]?.message ??
          (err as { message?: string })?.message ??
          this._translate.instant('validation.emailUpdateFailed'),
        life: 5000,
      });
    };

    if (this.modalType === 'business') {
      this._businessService
        .updateBusinessEmail({ email: newEmail })
        .subscribe({
          next: (updated: BusinessSchema) => {
            this.attempt = false;
            this._authStore.setBusiness(updated);
            this._ref.close(true);
          },
          error: onError,
        });
      return;
    }

    this._userService.updateUserEmail({ email: newEmail }).subscribe({
      next: (updated: UserSchema) => {
        this.attempt = false;
        this._authStore.setUser(updated);
        this._ref.close(true);
      },
      error: onError,
    });
  }
}
