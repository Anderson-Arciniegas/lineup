import { inject, Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import type { ToastMessageOptions } from 'primeng/api';

/**
 * Servicio para mostrar un toast y navegar después de un breve retraso.
 * Usar cuando se quiera mostrar un mensaje de éxito/error y luego redirigir:
 * sin el retraso, el toast no llega a pintarse porque la navegación destruye la vista.
 */
@Injectable({
  providedIn: 'root',
})
export class ToastNavigateService {
  private readonly _messageService = inject(MessageService);
  private readonly _router = inject(Router);

  private readonly _navigateDelayMs = 200;

  /**
   * Muestra el toast y navega tras un breve retraso para que el toast sea visible.
   */
  showAndNavigate(
    message: ToastMessageOptions,
    commands: unknown[],
    extras?: NavigationExtras
  ): void {
    this._messageService.add(message);
    setTimeout(() => {
      this._router.navigate(commands, extras).then();
    }, this._navigateDelayMs);
  }
}
