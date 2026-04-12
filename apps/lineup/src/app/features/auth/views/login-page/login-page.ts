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
import { BusinessPrivateService, UserPublicService } from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';

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
    TranslateModule,
    ReactiveFormsModule,
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
  @Inject(PLATFORM_ID) private _platform: any;

  private _subscription: Subscription = new Subscription();

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
              error: (err) => {
                console.error(err);
                this.attemptGoogle = false;
              },
            }),
          );
        },
      }),
    );
  }

  /** Envío del formulario clásico: login usuario y fallback a negocio en error. */
  onSubmit(): void {
    if (this.loginForm.invalid || this.attempt) {
      return;
    }
    this.attempt = true;
    this._subscription.add(
      this._users
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: (user) => {
            if (user) {
              this._authService.handleSuccessLogin(user);
            }
            this.attempt = false;
          },
          error: (error) => {
            console.error(error);
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
            }
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
        }),
    );
  }

  /** Crea el `FormGroup` con validadores mínimos en email y password. */
  private _createForm(): FormGroup {
    return this._fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }
}
