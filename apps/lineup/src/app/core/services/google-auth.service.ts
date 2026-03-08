import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '@lineup/envs';
import { Observable, Subject } from 'rxjs';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            context?: string;
            use_fedcm_for_prompt?: boolean;
            use_fedcm_for_button?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

const GSI_SCRIPT_ID = 'gsi-script';
const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private readonly _platformId = inject(PLATFORM_ID);
  private _scriptLoaded = false;
  private readonly _credentialSubject = new Subject<string>();

  /** Emite el id_token cuando el usuario completa el flujo con el botón de Google (popup). */
  get credential$(): Observable<string> {
    return this._credentialSubject.asObservable();
  }

  private loadScript(): Promise<void> {
    if (!isPlatformBrowser(this._platformId)) {
      return Promise.reject(
        new Error('Google Auth solo está disponible en el navegador'),
      );
    }
    if (this._scriptLoaded && window.google?.accounts?.id) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(GSI_SCRIPT_ID);
      if (existing) {
        this._scriptLoaded = true;
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = GSI_SCRIPT_ID;
      script.src = GSI_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this._scriptLoaded = true;
        resolve();
      };
      script.onerror = () =>
        reject(new Error('Error al cargar Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  /** Espera a que window.google.accounts.id esté disponible (el script puede tardar un poco). */
  private waitForGoogle(): Promise<void> {
    if (window.google?.accounts?.id) return Promise.resolve();
    return new Promise((resolve) => {
      const maxAttempts = 50;
      let attempts = 0;
      const check = (): void => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(check, 100);
        } else {
          resolve();
        }
      };
      setTimeout(check, 50);
    });
  }

  /**
   * Renderiza el botón oficial "Sign in with Google" en el elemento dado.
   * Usa flujo en popup (no One Tap / FedCM), evitando el error de FedCM deshabilitado.
   * Suscríbete a credential$ para recibir el id_token cuando el usuario termine.
   */
  renderButton(
    element: HTMLElement,
    options: {
      text?: 'signin_with' | 'signup_with';
      size?: 'large' | 'small';
    } = {},
  ): void {
    if (!isPlatformBrowser(this._platformId) || !element) return;
    this.loadScript()
      .then(() => this.waitForGoogle())
      .then(() => {
        if (!window.google?.accounts?.id) return;
        const clientId = environment.google.GOOGLE_ID;
        if (!clientId) {
          throw new Error('GOOGLE_ID no está configurado en environment');
        }
        window.google.accounts.id.initialize({
          client_id: clientId,
          context: options.text === 'signup_with' ? 'signup' : 'signin',
          use_fedcm_for_prompt: false,
          use_fedcm_for_button: false,
          callback: (response: { credential: string }) => {
            this._credentialSubject.next(response.credential);
          },
        });
        window.google.accounts.id.renderButton(element, {
          type: 'standard',
          theme: 'outline',
          size: options.size ?? 'large',
          text: options.text ?? 'signin_with',
          shape: 'circle',
          width: 240,
        });
      });
  }
}
