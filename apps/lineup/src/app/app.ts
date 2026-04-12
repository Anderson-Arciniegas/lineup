import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { BusinessPrivateService, UserPublicService } from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { Toast } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

/**
 * Componente raíz de la aplicación.
 *
 * Configura i18n por defecto y, en el navegador, intenta rehidratar la sesión
 * consultando el usuario y el negocio autenticados para sincronizar `AuthService`.
 */
@Component({
  imports: [
    RouterModule,
    ButtonModule,
    TranslateModule,
    DynamicDialogModule,
    Toast,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  protected title = 'lineup';

  protected translate = inject(TranslateService);
  private platformId: object = inject(PLATFORM_ID);
  private _user = inject(UserPublicService);
  private _auth = inject(AuthService);
  private _business = inject(BusinessPrivateService);
  private _subscription: Subscription = new Subscription();

  /** Registra idiomas disponibles y fija el idioma activo (español por defecto). */
  ngOnInit() {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  /**
   * Tras el primer render en el cliente, carga en paralelo el perfil de usuario y el negocio.
   * Actualiza o limpia el estado local según exista sesión válida en el backend.
   */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this._subscription.add(
      this._user
        .getMe()
        .pipe(take(1))
        .subscribe({
          next: (user) => {
            if (user) {
              this._auth.setUser(user);
              // this.refreshUserToken();
            } else {
              this._auth.removeUser(false);
            }
          },
          error: (error) => {
            console.error(error);
            // this._auth.removeUser(false);
          },
        }),
    );

    this._subscription.add(
      this._business
        .myBusiness()
        .pipe(take(1))
        .subscribe({
          next: (business) => {
            if (business) {
              this._auth.setBusiness(business);
              // this.refreshBusinessToken();
            } else {
              this._auth.removeUser(false);
            }
          },
          error: (error) => {
            console.error(error);
            // this._auth.removeUser(false);
          },
        }),
    );
  }

  /** Solicita un token renovado del usuario (uso opcional / futuro). */
  refreshUserToken(): void {
    this._subscription.add(this._user.refreshToken().subscribe());
  }

  /** Solicita un token renovado del negocio (uso opcional / futuro). */
  refreshBusinessToken(): void {
    this._subscription.add(this._business.refreshToken().subscribe());
  }

  /** Libera suscripciones para evitar fugas de memoria al destruir el root. */
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
