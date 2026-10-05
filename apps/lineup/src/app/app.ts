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
import { LanguageService } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { Toast } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { NativeShellService } from './core/services/native-shell.service';
import { CartDrawer } from '../../../../libs/shared/ui/src/lib/cart-drawer/cart-drawer';

/**
 * Componente raíz de la aplicación.
 *
 * Configura i18n (idioma preferido desde localStorage, default español) y, en el
 * navegador, rehidrata la sesión según `sessionType` + cookies HttpOnly del API.
 */
@Component({
  imports: [
    RouterModule,
    ButtonModule,
    TranslateModule,
    DynamicDialogModule,
    Toast,
    CartDrawer,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  protected title = 'lineup';

  private readonly _languageService = inject(LanguageService);
  private platformId: object = inject(PLATFORM_ID);
  private _auth = inject(AuthService);
  private readonly _nativeShell = inject(NativeShellService);
  private _subscription: Subscription = new Subscription();

  /** Restaura el idioma preferido (o español por defecto) vía LanguageService. */
  ngOnInit() {
    this._languageService.init();
  }

  /**
   * Tras el primer render en el cliente, rehidrata solo el tipo de sesión
   * persistido (`user` | `business`) para no borrar flags locales por errores
   * del API cruzado.
   */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this._subscription.add(
      this._auth.restoreSession().pipe(take(1)).subscribe(),
    );
    void this._nativeShell.attachBackButton();
  }

  /** Libera suscripciones para evitar fugas de memoria al destruir el root. */
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    void this._nativeShell.detachBackButton();
  }
}
