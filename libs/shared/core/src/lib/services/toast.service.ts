import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ApiError } from '../models/api-error.model';
import { ApiErrorService } from './api-error.service';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

/** Parámetros de interpolación para `TranslateService.instant`. */
export type ToastParams = Record<string, unknown>;

/**
 * Servicio estándar de notificaciones flotantes (PrimeNG `p-toast` montado en el root).
 *
 * - Traduce `summary` y `detail` con ngx-translate.
 * - Evita duplicados del mismo mensaje dentro de una ventana corta (ráfagas de errores).
 * - No hace nada en SSR.
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  static readonly DEDUPE_WINDOW_MS = 3000;
  static readonly DEFAULT_LIFE_MS = 3000;
  static readonly ERROR_LIFE_MS = 5000;

  private readonly _messageService = inject(MessageService);
  private readonly _translate = inject(TranslateService);
  private readonly _apiError = inject(ApiErrorService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _recent = new Map<string, number>();

  /** Toast de éxito con `detailKey` traducida. */
  success(detailKey: string, params?: ToastParams): void {
    this._show('success', 'general.success', detailKey, params);
  }

  /** Toast informativo con `detailKey` traducida. */
  info(detailKey: string, params?: ToastParams): void {
    this._show('info', 'general.info', detailKey, params);
  }

  /** Toast de advertencia con `detailKey` traducida. */
  warn(detailKey: string, params?: ToastParams): void {
    this._show('warn', 'general.warning', detailKey, params);
  }

  /** Toast de error con `detailKey` traducida. */
  error(detailKey: string, params?: ToastParams): void {
    this._show(
      'error',
      'general.error',
      detailKey,
      params,
      ToastService.ERROR_LIFE_MS,
    );
  }

  /**
   * Normaliza un error de API y muestra el toast estándar correspondiente.
   * Devuelve el `ApiError` para que el llamador pueda decidir lógica adicional.
   * No muestra toast cuando el error es "Cookie not sent" (sesión inválida).
   */
  apiError(error: unknown): ApiError {
    const normalized = this._apiError.normalize(error);
    if (!this._apiError.isCookieNotSentError(normalized)) {
      this.error(normalized.i18nKey);
    }
    return normalized;
  }

  /** Limpia el registro de deduplicación (útil en tests). */
  resetDedupe(): void {
    this._recent.clear();
  }

  private _show(
    severity: ToastSeverity,
    summaryKey: string,
    detailKey: string,
    params?: ToastParams,
    life: number = ToastService.DEFAULT_LIFE_MS,
  ): void {
    if (!isPlatformBrowser(this._platformId)) return;

    const detail = this._translate.instant(detailKey, params);
    if (this._isDuplicate(severity, detail)) return;

    this._messageService.add({
      severity,
      summary: this._translate.instant(summaryKey),
      detail,
      life,
    });
  }

  private _isDuplicate(severity: ToastSeverity, detail: string): boolean {
    const now = Date.now();
    const key = `${severity}|${detail}`;
    const last = this._recent.get(key);

    for (const [k, ts] of this._recent) {
      if (now - ts > ToastService.DEDUPE_WINDOW_MS) this._recent.delete(k);
    }

    if (last !== undefined && now - last < ToastService.DEDUPE_WINDOW_MS) {
      return true;
    }
    this._recent.set(key, now);
    return false;
  }
}
