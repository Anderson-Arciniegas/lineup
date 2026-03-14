import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { BusinessService, UserService } from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { Button } from '../button/button';

export type UpdatePasswordModalType = 'user' | 'business';

export interface UpdatePasswordModalData {
  type: UpdatePasswordModalType;
}

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword')?.value;
    const confirmNewPassword = control.get('confirmNewPassword')?.value;
    if (!newPassword || !confirmNewPassword) {
      return null;
    }
    return newPassword === confirmNewPassword
      ? null
      : { passwordMismatch: true };
  };
}

@Component({
  selector: 'lib-update-password-modal',
  imports: [
    CommonModule,
    DialogModule,
    ReactiveFormsModule,
    TranslateModule,
    Button,
    FloatLabel,
    PasswordModule,
  ],
  templateUrl: './update-password-modal.html',
  styleUrl: './update-password-modal.scss',
})
export class UpdatePasswordModal implements OnInit {
  form: FormGroup;
  attempt = false;
  modalType: UpdatePasswordModalType = 'user';

  private readonly _fb = inject(FormBuilder);
  private readonly _ref = inject(DynamicDialogRef);
  private readonly _config = inject(DynamicDialogConfig);
  private readonly _userService = inject(UserService);
  private readonly _businessService = inject(BusinessService);
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);

  ngOnInit(): void {
    const data = this._config.data as UpdatePasswordModalData | undefined;
    this.modalType = data?.type ?? 'user';
    this.form = this._fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmNewPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator() },
    );
  }

  get currentPasswordControl(): AbstractControl | null {
    return this.form.get('currentPassword');
  }

  get newPasswordControl(): AbstractControl | null {
    return this.form.get('newPassword');
  }

  get confirmNewPasswordControl(): AbstractControl | null {
    return this.form.get('confirmNewPassword');
  }

  get isConfirmPasswordMismatch(): boolean {
    return (
      (this.form?.errors?.['passwordMismatch'] ?? false) &&
      (this.confirmNewPasswordControl?.dirty ||
        this.confirmNewPasswordControl?.touched)
    );
  }

  cancel(): void {
    this._ref.close(false);
  }

  submit(): void {
    if (this.form.invalid || this.attempt) {
      this.form.markAllAsTouched();
      return;
    }
    this.attempt = true;
    const { currentPassword, newPassword } = this.form.getRawValue();
    const request = { currentPassword, newPassword };

    const request$ =
      this.modalType === 'business'
        ? this._businessService.changeBusinessPassword(request)
        : this._userService.changePassword(request);

    request$.subscribe({
      next: () => {
        this.attempt = false;
        this._ref.close(true);
      },
      error: (err) => {
        this.attempt = false;
        this._messageService.add({
          severity: 'error',
          summary: this._translate.instant('general.error'),
          detail:
            err?.graphQLErrors?.[0]?.message ??
            err?.message ??
            this._translate.instant('validation.passwordUpdateFailed'),
          life: 5000,
        });
      },
    });
  }
}
