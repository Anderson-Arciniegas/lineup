import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  ApiErrorService,
  BusinessPrivateService,
  ToastService,
  UserPublicService,
} from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';
import {
  getEmailFieldError,
  getPasswordFieldError,
} from '../../utils/form-field-error';

/**
 * Inicio de sesión unificado: intenta primero como usuario consumidor y, si falla, como negocio.
 * Incluye botón de Google OAuth renderizado tras la vista y manejo del token vía `GoogleAuthService`.
 */
@Component({
  selector: 'app-login-page',
  imports: [
    CommonModule,
    Button,
    InputTextModule,
    FloatLabelModule,
    PasswordModule,
    ProgressSpinner,
    TranslateModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLDivElement>;
  loginForm: FormGroup;
  attempt = false;
  attemptGoogle = false;
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _users = inject(UserPublicService);
  private readonly _business = inject(BusinessPrivateService);
  private readonly _googleAuth = inject(GoogleAuthService);
  private readonly _toast = inject(ToastService);
  private readonly _apiError = inject(ApiErrorService);
  @Inject(PLATFORM_ID) private _platform: any;

  private _subscription: Subscription = new Subscription();

  emailError = getEmailFieldError;
  passwordError = getPasswordFieldError;

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  /** Construye el formulario reactivo de email/contraseña. */
  ngOnInit(): void {
    this.loginForm = this._createForm();
  }

  /** Monta el widget de Google y escucha credenciales emitidas por el servicio. */
  ngAfterViewInit(): void {
    setTimeout(() => {
      const el = this.googleBtnRef?.nativeElement;
      if (el) {
        this._googleAuth.renderButton(el, {
          text: 'signin_with',
        });
      }
    }, 100);
    this._subscription.add(
      this._googleAuth.credential$.subscribe((token) =>
        this._handleGoogleToken(token),
      ),
    );
  }

  /** Libera suscripciones al token de Google y peticiones HTTP. */
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  /**
   * Intercambia el JWT de Google con el backend: primero endpoint de usuario,
   * y en error reintenta con el de negocio para cubrir cuentas duales.
   */
  private _handleGoogleToken(token: string): void {
    this.attemptGoogle = true;
    this._subscription.add(
      this._users.loginWithGoogle({ token }).subscribe({
        next: (response) => {
          this.attemptGoogle = false;
          if (response.user) {
            this._authService.handleSuccessLogin(response.user);
          } else if (response.business) {
            this._authService.handleSuccessLogin(undefined, response.business);
          }
        },
        error: () => {
          this._subscription.add(
            this._business.loginWithGoogle({ token }).subscribe({
              next: (response) => {
                this.attemptGoogle = false;
                if (response.business) {
                  this._authService.handleSuccessLogin(
                    undefined,
                    response.business,
                  );
                } else if (response.user) {
                  this._authService.handleSuccessLogin(response.user);
                }
              },
              error: (error: unknown) => {
                this.attemptGoogle = false;
                this._notifyLoginFailure(error, 'auth.googleLoginFailed');
              },
            }),
          );
        },
      }),
    );
  }

  /**
   * Muestra el toast de error del login: red y códigos de negocio usan la clave
   * normalizada; el resto conserva el mensaje de dominio de la tarea (credenciales / Google).
   */
  private _notifyLoginFailure(error: unknown, fallbackKey: string): void {
    const normalized = this._apiError.normalize(error);
    const useMappedKey =
      normalized.httpStatus === 0 || normalized.code != null;
    this._toast.error(useMappedKey ? normalized.i18nKey : fallbackKey);
  }

  /** Envío del formulario clásico: login usuario y fallback a negocio en error. */
  onSubmit(): void {
    if (this.loginForm.invalid || this.attempt) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.attempt = true;
    this._subscription.add(
      this._users
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: (user) => {
            if (user) {
              this.attempt = false;
              this._authService.handleSuccessLogin(user);
              return;
            }
            // Respuesta sin usuario (p. ej. data parcial): intentar como negocio.
            this.loginBusiness();
          },
          error: () => {
            this.loginBusiness();
          },
        }),
    );
  }

  /** Segundo intento de autenticación con las mismas credenciales contra la API de negocio. */
  loginBusiness(): void {
    this._subscription.add(
      this._business
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: (business) => {
            this.attempt = false;
            if (business) {
              this._authService.handleSuccessLogin(null, business);
              return;
            }
            this._notifyLoginFailure(
              new Error('Business login returned empty payload'),
              'auth.invalidCredentials',
            );
          },
          error: (error: unknown) => {
            this.attempt = false;
            this._notifyLoginFailure(error, 'auth.invalidCredentials');
          },
        }),
    );
  }

  /** Crea el `FormGroup`: el login solo exige contraseña presente, no el patrón de registro. */
  private _createForm(): FormGroup {
    return this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }
}
