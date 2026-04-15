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
  CreateUserInput,
  PasswordValidation,
  RolesCodesEnum,
  UserPublicService,
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
 * Registro de usuario final con validación de contraseña fuerte, verificación por correo (modal)
 * y opción de alta con Google limitada al rol consumidor.
 */
@Component({
  selector: 'app-register-user-page',
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
  templateUrl: './register-user-page.html',
  styleUrl: './register-user-page.scss',
})
export class RegisterUserPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLDivElement>;
  private readonly _routes = AppConfigService.config.routes ?? appRoutes;
  readonly termsPath = `/${this._routes.info}/${this._routes.termsAndConditions}`;
  readonly privacyPath = `/${this._routes.info}/${this._routes.privacyPolicy}`;
  registerUserForm!: FormGroup;
  attempt = false;
  attemptGoogle = false;
  private readonly _fb = inject(FormBuilder);
  private readonly _users = inject(UserPublicService);
  private readonly _authService = inject(AuthService);
  private readonly _googleAuth = inject(GoogleAuthService);
  private readonly _dialogService = inject(DialogService);
  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);

  private _subscription: Subscription = new Subscription();
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.registerUserForm = this._createForm();
  }

  ngAfterViewInit(): void {
    const acceptCtrl = this.registerUserForm.get('acceptTerms');
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

  /** Registro OAuth solo para rol `USER`; completa sesión si el backend devuelve perfil. */
  private _handleGoogleToken(token: string): void {
    if (!this.registerUserForm.get('acceptTerms')?.value) {
      return;
    }
    this.attemptGoogle = true;
    this._subscription.add(
      this._users
        .registerWithGoogle({ token, role: RolesCodesEnum.USER })
        .subscribe({
          next: (response) => {
            this.attemptGoogle = false;
            if (response.user) {
              this._authService.handleSuccessLogin(response.user);
            }
          },
          error: (err) => {
            console.error(err);
            this.attemptGoogle = false;
          },
        }),
    );
  }

  /**
   * Abre el flujo de código de verificación; tras confirmación crea el usuario
   * y redirige vía `AuthService` si la mutación GraphQL tiene éxito.
   */
  onSubmit(): void {
    if (this.registerUserForm.invalid || this.attempt) {
      this.registerUserForm.markAllAsTouched();
      return;
    }
    this.attempt = true;
    const { firstName, lastName, email, password } =
      this.registerUserForm.value;

    // Primero: abrir modal de verificación de código y, si es válido, crear el usuario
    const ref = this._dialogService.open(VerificationCodeModal, {
      header: this._translate.instant('verificationCodeModal.title'),
      width: '400px',
      style: { maxHeight: '80vh' },
      dismissableMask: true,
      modal: true,
      draggable: false,
      resizable: false,
      data: {
        type: 'user',
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

        const userData: CreateUserInput = {
          firstName,
          lastName,
          email,
          password,
          role: RolesCodesEnum.USER,
        };

        this._subscription.add(
          this._users.createUser(userData).subscribe({
            next: (user) => {
              this.attempt = false;
              if (user) {
                this._authService.handleSuccessLogin(user);
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

  /** Formulario con validador cruzado `MatchPassword` entre password y confirmación. */
  private _createForm(): FormGroup {
    const formOptions: AbstractControlOptions = {
      validators: [PasswordValidation.MatchPassword],
    };
    return this._fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
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
