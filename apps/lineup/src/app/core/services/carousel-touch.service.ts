import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

type GestureAxis = 'horizontal' | 'vertical' | null;

/**
 * Permite desplazamiento vertical de página sobre carruseles PrimeNG.
 *
 * PrimeNG cancela todos los `touchmove`, incluso los verticales. Este listener
 * en fase de captura deja llegar al carrusel solo los gestos horizontales.
 */
@Injectable({
  providedIn: 'root',
})
export class CarouselTouchService {
  private readonly _document = inject(DOCUMENT);
  private readonly _platformId = inject(PLATFORM_ID);
  private _isAttached = false;
  private _touchId: number | null = null;
  private _startX = 0;
  private _startY = 0;
  private _axis: GestureAxis = null;

  attach(): void {
    if (!isPlatformBrowser(this._platformId) || this._isAttached) {
      return;
    }
    this._isAttached = true;
    this._document.addEventListener('touchstart', this._onTouchStart, {
      capture: true,
      passive: true,
    });
    this._document.addEventListener('touchmove', this._onTouchMove, {
      capture: true,
      passive: true,
    });
    this._document.addEventListener('touchend', this._onTouchEnd, {
      capture: true,
      passive: true,
    });
    this._document.addEventListener('touchcancel', this._onTouchCancel, {
      capture: true,
      passive: true,
    });
  }

  detach(): void {
    if (!this._isAttached) {
      return;
    }
    this._document.removeEventListener('touchstart', this._onTouchStart, true);
    this._document.removeEventListener('touchmove', this._onTouchMove, true);
    this._document.removeEventListener('touchend', this._onTouchEnd, true);
    this._document.removeEventListener('touchcancel', this._onTouchCancel, true);
    this._resetGesture();
    this._isAttached = false;
  }

  private readonly _onTouchStart = (event: TouchEvent): void => {
    const target = event.target;
    if (
      !(target instanceof Element) ||
      !target.closest('.p-carousel-viewport')
    ) {
      this._resetGesture();
      return;
    }
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    this._touchId = touch.identifier;
    this._startX = touch.clientX;
    this._startY = touch.clientY;
    this._axis = null;
  };

  private readonly _onTouchMove = (event: TouchEvent): void => {
    const touch = this._findTrackedTouch(event.touches);
    if (!touch) {
      return;
    }
    const deltaX = Math.abs(touch.clientX - this._startX);
    const deltaY = Math.abs(touch.clientY - this._startY);

    if (!this._axis && Math.max(deltaX, deltaY) >= 6) {
      this._axis = deltaY >= deltaX ? 'vertical' : 'horizontal';
    }

    // Mientras se determina el eje también evitamos que PrimeNG cancele el
    // primer movimiento y bloquee prematuramente el scroll nativo.
    if (!this._axis || this._axis === 'vertical') {
      event.stopImmediatePropagation();
    }
  };

  private readonly _onTouchEnd = (event: TouchEvent): void => {
    if (this._touchId === null) {
      return;
    }
    const trackedTouchEnded = Array.from(event.changedTouches).some(
      (touch) => touch.identifier === this._touchId,
    );
    if (!trackedTouchEnded) {
      return;
    }
    if (this._axis === 'vertical') {
      event.stopImmediatePropagation();
    }
    this._resetGesture();
  };

  private readonly _onTouchCancel = (): void => {
    this._resetGesture();
  };

  private _findTrackedTouch(touches: TouchList): Touch | null {
    if (this._touchId === null) {
      return null;
    }
    return (
      Array.from(touches).find(
        (touch) => touch.identifier === this._touchId,
      ) ?? null
    );
  }

  private _resetGesture(): void {
    this._touchId = null;
    this._axis = null;
  }
}
