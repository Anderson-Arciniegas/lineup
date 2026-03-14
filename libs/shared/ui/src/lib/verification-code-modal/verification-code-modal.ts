import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  BaseResponse,
  BusinessEmailVerificationService,
  CreateVerificationCodeDto,
  SendVerificationCodeInput,
  UserEmailVerificationService,
  VerificationCodeChannelEnum,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from '../button/button';

export type VerificationCodeModalType = 'user' | 'business';

export interface VerificationCodeModalData {
  type: VerificationCodeModalType;
  email?: string | null;
}

@Component({
  selector: 'lib-verification-code-modal',
  imports: [
    CommonModule,
    DialogModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    Button,
    InputOtpModule,
  ],
  templateUrl: './verification-code-modal.html',
  styleUrl: './verification-code-modal.scss',
})
export class VerificationCodeModal implements OnInit {
  form: FormGroup;
  attempt = false;
  resending = false;
  modalType: VerificationCodeModalType = 'user';
  email: string | null = null;
  maskedEmail: string | null = null;

  private readonly _fb = inject(FormBuilder);
  private readonly _ref = inject(DynamicDialogRef);
  private readonly _config = inject(DynamicDialogConfig);
  private readonly _userEmailVerificationService = inject(
    UserEmailVerificationService,
  );
  private readonly _businessEmailVerificationService = inject(
    BusinessEmailVerificationService,
  );
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);

  ngOnInit(): void {
    const data = this._config.data as VerificationCodeModalData | undefined;
    this.modalType = data?.type ?? 'user';
    this.email = data?.email ?? null;
    this.maskedEmail = this.email ? this._maskEmail(this.email) : null;

    this.form = this._fb.group({
      code: ['', Validators.required],
    });

    this._sendVerificationCode();
  }

  get codeControl(): AbstractControl | null {
    return this.form.get('code');
  }

  private _getSendCodeRequest(): Observable<BaseResponse> {
    const hasEmail = !!this.email;
    if (hasEmail) {
      const payload: SendVerificationCodeInput = {
        email: this.email as string,
      };
      return this.modalType === 'business'
        ? this._businessEmailVerificationService.sendVerificationCode(payload)
        : this._userEmailVerificationService.sendVerificationCode(payload);
    }
    const dto: CreateVerificationCodeDto = {
      channel: VerificationCodeChannelEnum.EMAIL,
    };
    return this.modalType === 'business'
      ? this._businessEmailVerificationService.sendBusinessVerificationCode(dto)
      : this._userEmailVerificationService.sendUserVerificationCode(dto);
  }

  private _showSendCodeError(err: unknown): void {
    this._messageService.add({
      severity: 'error',
      summary: this._translate.instant('general.error'),
      detail:
        (err as { graphQLErrors?: Array<{ message?: string }> })?.graphQLErrors?.[0]?.message ??
        (err as { message?: string })?.message ??
        this._translate.instant('verificationCodeModal.verificationFailed'),
      life: 5000,
    });
  }

  private _sendVerificationCode(): void {
    this._getSendCodeRequest().subscribe({
      error: (err) => this._showSendCodeError(err),
    });
  }

  resendCode(): void {
    if (this.resending) return;
    this.resending = true;
    this._getSendCodeRequest().subscribe({
      next: () => {
        this.resending = false;
      },
      error: (err) => {
        this.resending = false;
        this._showSendCodeError(err);
      },
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

  cancel(): void {
    this._ref.close(false);
  }

  submit(): void {
    if (this.form.invalid || this.attempt) {
      this.form.markAllAsTouched();
      return;
    }

    this.attempt = true;
    const code = this.codeControl?.value as string;
    const hasEmail = !!this.email;

    const request$ =
      this.modalType === 'business'
        ? hasEmail
          ? this._businessEmailVerificationService.verifyCode({
              code,
              email: this.email as string,
            })
          : this._businessEmailVerificationService.verifyBusinessVerificationCode(
              {
                code,
              },
            )
        : hasEmail
          ? this._userEmailVerificationService.verifyCode({
              code,
              email: this.email as string,
            })
          : this._userEmailVerificationService.verifyUserVerificationCode({
              code,
            });

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
            this._translate.instant('verificationCodeModal.verificationFailed'),
          life: 5000,
        });
      },
    });
  }
}
