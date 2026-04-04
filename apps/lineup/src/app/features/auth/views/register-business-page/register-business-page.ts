import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  BusinessPrivateService,
  CreateBusinessInput,
  PasswordValidation,
  RolesCodesEnum,
} from '@lineup/core';
import { Button, VerificationCodeModal } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Subscription, take } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';

@Component({
  selector: 'app-register-business-page',
  imports: [
    CommonModule,
    Button,
    InputTextModule,
    FloatLabelModule,
    PasswordModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-business-page.html',
  styleUrl: './register-business-page.scss',
})
export class RegisterBusinessPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLDivElement>;
  registerBusinessForm: FormGroup;
  attempt = false;
  attemptGoogle = false;
  private readonly _fb = inject(FormBuilder);
  private readonly _business = inject(BusinessPrivateService);
  private readonly _authService = inject(AuthService);
  private readonly _googleAuth = inject(GoogleAuthService);
  private readonly _dialogService = inject(DialogService);
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);

  private _subscription: Subscription = new Subscription();
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.registerBusinessForm = this._createForm();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const el = this.googleBtnRef?.nativeElement;
      if (el) {
        this._googleAuth.renderButton(el, {
          text: 'signup_with',
        });
      }
    }, 100);
    this._subscription.add(
      this._googleAuth.credential$.subscribe((token) =>
        this._handleGoogleToken(token),
      ),
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  private _handleGoogleToken(token: string): void {
    this.attemptGoogle = true;
    this._subscription.add(
      this._business.registerWithGoogle({ token }).subscribe({
        next: (response) => {
          this.attemptGoogle = false;
          if (response.business) {
            this._authService.handleSuccessLogin(
              undefined,
              response.business,
              true,
            );
          }
        },
        error: (err) => {
          console.error(err);
          this.attemptGoogle = false;
        },
      }),
    );
  }

  onSubmit(): void {
    if (this.registerBusinessForm.invalid || this.attempt) {
      this.registerBusinessForm.markAllAsTouched();
      return;
    }
    this.attempt = true;
    const { name, email, password } = this.registerBusinessForm.value;

    const ref = this._dialogService.open(VerificationCodeModal, {
      header: this._translate.instant('verificationCodeModal.title'),
      width: '400px',
      style: { maxHeight: '80vh' },
      dismissableMask: true,
      modal: true,
      draggable: false,
      resizable: false,
      data: {
        type: 'business',
        email,
      },
    });

    this._subscription.add(
      ref.onClose
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe((verified: boolean) => {
        if (!verified) {
          this.attempt = false;
          return;
        }

        const businessData: CreateBusinessInput = {
          name,
          email,
          password,
          role: RolesCodesEnum.BUSINESS,
        };

        this._subscription.add(
          this._business.createBusiness(businessData).subscribe({
            next: (business) => {
              this.attempt = false;
              if (business) {
                this._authService.handleSuccessLogin(null, business, true);
              }
            },
            error: (err) => {
              this.attempt = false;
              console.error(err);
              this._messageService.add({
                severity: 'error',
                summary: this._translate.instant('general.error'),
                detail:
                  err?.graphQLErrors?.[0]?.message ??
                  err?.message ??
                  this._translate.instant(
                    'verificationCodeModal.verificationFailed',
                  ),
                life: 5000,
              });
            },
          }),
        );
      }),
    );
  }

  private _createForm(): FormGroup {
    const formOptions: AbstractControlOptions = {
      validators: [PasswordValidation.MatchPassword],
    };
    return this._fb.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20),
            Validators.pattern(
              /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/,
            ),
          ],
        ],
        confirmPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20),
            Validators.pattern(
              /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/,
            ),
          ],
        ],
      },
      formOptions,
    );
  }
}
