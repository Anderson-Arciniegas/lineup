import { Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { ImagePreviewBackService } from './image-preview-back.service';

/**
 * Puente mínimo con el shell nativo. En el navegador no hace nada.
 * En Android, el botón atrás sigue el historial del WebView.
 */
@Injectable({
  providedIn: 'root',
})
export class NativeShellService {
  private readonly _location = inject(Location);
  private readonly _imagePreviewBack = inject(ImagePreviewBackService);
  private _backButtonHandle: PluginListenerHandle | null = null;

  /** Registra el botón atrás solo cuando la app corre dentro de Capacitor. */
  async attachBackButton(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this._backButtonHandle) {
      return;
    }

    this._backButtonHandle = await App.addListener(
      'backButton',
      ({ canGoBack }) => {
        if (this._closeImagePreviewIfOpen()) {
          return;
        }
        if (canGoBack) {
          this._location.back();
          return;
        }
        void App.exitApp();
      },
    );
  }

  /** Cierra preview de imagen si está abierto (DOM o servicio). */
  private _closeImagePreviewIfOpen(): boolean {
    if (this._imagePreviewBack.closeIfOpen()) {
      return true;
    }
    const closeBtn = document.querySelector(
      '.p-image-mask .p-image-close-button',
    ) as HTMLButtonElement | null;
    if (closeBtn) {
      closeBtn.click();
      return true;
    }
    return false;
  }

  /** Quita el listener al destruir la raíz de la app. */
  async detachBackButton(): Promise<void> {
    await this._backButtonHandle?.remove();
    this._backButtonHandle = null;
  }
}
