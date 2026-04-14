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
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AppConfigService,
  appRoutes,
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
import { startWith, Subscription, take } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';

/**
 * Registro de cuenta de negocio: formulario con verificación por email y alta opcional con Google.
 * Tras crear el negocio, `AuthService` recibe la sesión y puede marcar onboarding.
 */
@Component({
  selector: 'app-register-business-page',
  imports: [
    CommonModule,
    RouterLink,
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
  private readonly _routes = AppConfigService.config.routes ?? appRoutes;
  readonly termsPath = `/${this._routes.info}/${this._routes.termsAndConditions}`;
  readonly privacyPath = `/${this._routes.info}/${this._routes.privacyPolicy}`;
  registerBusinessForm!: FormGroup;
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
    const acceptCtrl = this.registerBusinessForm.get('acceptTerms');
    if (acceptCtrl) {
      this._subscription.add(
        acceptCtrl.valueChanges
          .pipe(startWith(acceptCtrl.value))
          .subscribe((accepted) => {
            if (accepted) {
              setTimeout(() => this._renderGoogleButton(), 100);
            }
          }),
      );
    }
    this._subscription.add(
      this._googleAuth.credential$.subscribe((token) =>
        this._handleGoogleToken(token),
      ),
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  private _renderGoogleButton(): void {
    const el = this.googleBtnRef?.nativeElement;
    if (!el) return;
    el.innerHTML = '';
    this._googleAuth.renderButton(el, {
      text: 'signup_with',
    });
  }

  /** Registro OAuth de negocio; al éxito delega en `handleSuccessLogin` con flag de registro. */
  private _handleGoogleToken(token: string): void {
    if (!this.registerBusinessForm.get('acceptTerms')?.value) {
      return;
    }
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

  /** Verificación por código y creación del negocio con manejo de errores GraphQL en toast. */
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

  /** Formulario con validación de contraseña y coincidencia con confirmación. */
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
        acceptTerms: [false, [Validators.requiredTrue]],
      },
      formOptions,
    );
  }
}
