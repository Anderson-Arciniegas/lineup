import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { unblockBodyScroll } from 'primeng/dom';

const PREVIEW_STATE_KEY = 'lineupImagePreview';

type PreviewCloser = () => void;

/**
 * Hace que el botón atrás cierre el preview de `p-image` en lugar de navegar.
 * Usa una entrada de historial propia y un closer registrado por la vista.
 */
@Injectable({
  providedIn: 'root',
})
export class ImagePreviewBackService {
  private readonly _platformId = inject(PLATFORM_ID);
  private _open = false;
  private _historyPushed = false;
  private _closer: PreviewCloser | null = null;
  private _listening = false;
  private _suppressNextPop = false;

  /** True si hay un preview de imagen activo. */
  get isOpen(): boolean {
    return this._open;
  }

  /**
   * Cierra el preview abierto (si lo hay) sin navegar.
   * @returns true si había preview y se cerró.
   */
  closeIfOpen(): boolean {
    if (!this._open) {
      return false;
    }
    this._closer?.();
    if (!this._closer) {
      this._clickDomClose();
    }
    return true;
  }

  /**
   * Limpia el preview al abandonar la vista. No navega el historial porque el
   * Router ya está procesando el cambio de ruta.
   */
  closeForNavigation(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }
    const closer = this._closer;
    this._open = false;
    this._historyPushed = false;
    this._closer = null;
    this._suppressNextPop = false;
    closer?.();
    this._removeOrphanedOverlays();
  }

  /** Registra apertura: pushState + closer para popstate/Capacitor. */
  onPreviewShow(closer: PreviewCloser): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }
    this._ensurePopStateListener();
    this._closer = closer;
    this._open = true;
    if (!this._historyPushed) {
      history.pushState({ [PREVIEW_STATE_KEY]: true }, '');
      this._historyPushed = true;
    }
  }

  /**
   * Registra cierre desde la UI (Escape/máscara/botón).
   * Si aún hay state propio, hace history.back() para limpiarlo.
   */
  onPreviewHide(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }
    const hadHistory = this._historyPushed;
    this._open = false;
    this._closer = null;
    if (hadHistory) {
      this._historyPushed = false;
      this._suppressNextPop = true;
      history.back();
    }
  }

  private _ensurePopStateListener(): void {
    if (this._listening || !isPlatformBrowser(this._platformId)) {
      return;
    }
    this._listening = true;
    window.addEventListener('popstate', () => this._onPopState());
  }

  private _onPopState(): void {
    if (this._suppressNextPop) {
      this._suppressNextPop = false;
      return;
    }
    if (!this._open) {
      return;
    }
    this._historyPushed = false;
    this._open = false;
    const closer = this._closer;
    this._closer = null;
    closer?.();
    if (!closer) {
      this._clickDomClose();
    }
  }

  private _clickDomClose(): void {
    const closeBtn = document.querySelector(
      '.p-image-mask .p-image-close-button',
    ) as HTMLButtonElement | null;
    closeBtn?.click();
  }

  private _removeOrphanedOverlays(): void {
    document
      .querySelectorAll<HTMLElement>('.p-image-mask')
      .forEach((mask) => mask.remove());
    unblockBodyScroll();
  }
}
