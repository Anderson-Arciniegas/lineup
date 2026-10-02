import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

import {
  ApiService,
  AppConfigService,
  AuthStore,
  BusinessSchema,
  BusinessPrivateService,
  EncryptionService,
  NotificationsSocketService,
  StorageService,
  ToastService,
  UserSchema,
  UserPublicService,
  UtilsService,
} from '@lineup/core';
import { environment } from '@lineup/envs';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private static readonly BUSINESS_ONBOARDING_PENDING_KEY =
    'businessOnboardingPending';
  private _api = inject(ApiService);
  private _authStore = inject(AuthStore);
  private _utilsService = inject(UtilsService);
  private _storageService = inject(StorageService);
  private _encryptionService = inject(EncryptionService);
  private _platformId = inject(PLATFORM_ID);
  private _user = inject(UserPublicService);
  private _business = inject(BusinessPrivateService);
  private _notificationsSocket = inject(NotificationsSocketService);
  private _toast = inject(ToastService);

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this._platformId)) {
      return this._storageService.get('loggedUser') ? true : false;
    } else {
      return false;
    }
  }

  /**
   * Rehidrata la sesión al arrancar el cliente.
   *
   * Solo consulta el API del `sessionType` guardado: llamar a user y business
   * en paralelo borraba `loggedUser` cuando el API "equivocado" respondía vacío,
   * dejando las cookies HttpOnly del API intactas y la UI como si no hubiera sesión.
   */
  restoreSession(): Observable<boolean> {
    if (!isPlatformBrowser(this._platformId) || !this.isLoggedIn()) {
      return of(false);
    }

    const sessionType = this.getSessionType();
    if (sessionType === 'business') {
      return this._restoreBusinessSession();
    }
    if (sessionType === 'user') {
      return this._restoreUserSession();
    }

    // Flag huérfano sin tipo: no tocar cookies; limpiar solo el estado local.
    this.removeUser(false);
    return of(false);
  }

  private _restoreBusinessSession(): Observable<boolean> {
    return this._business.myBusiness().pipe(
      take(1),
      switchMap((business) => {
        if (business) {
          this.setBusiness(business as BusinessSchema);
          return of(true);
        }
        return this._refreshThenLoadBusiness();
      }),
      catchError(() => this._refreshThenLoadBusiness()),
    );
  }

  private _restoreUserSession(): Observable<boolean> {
    return this._user.getMe().pipe(
      take(1),
      switchMap((user) => {
        if (user) {
          this.setUser(user as UserSchema);
          return of(true);
        }
        return this._refreshThenLoadUser();
      }),
      catchError(() => this._refreshThenLoadUser()),
    );
  }

  private _refreshThenLoadBusiness(): Observable<boolean> {
    return this._business.refreshToken().pipe(
      take(1),
      switchMap(() => this._business.myBusiness().pipe(take(1))),
      map((business) => {
        if (business) {
          this.setBusiness(business as BusinessSchema);
          return true;
        }
        this.removeUser(false);
        return false;
      }),
      catchError(() => {
        this.removeUser(false);
        return of(false);
      }),
    );
  }

  private _refreshThenLoadUser(): Observable<boolean> {
    return this._user.refreshToken().pipe(
      take(1),
      switchMap(() => this._user.getMe().pipe(take(1))),
      map((user) => {
        if (user) {
          this.setUser(user as UserSchema);
          return true;
        }
        this.removeUser(false);
        return false;
      }),
      catchError(() => {
        this.removeUser(false);
        return of(false);
      }),
    );
  }

  get userValue() {
    return this._authStore.user();
  }

  get businessValue() {
    return this._authStore.business();
  }

  /** Cierra la sesión actual (solo puede haber una: user o business). */
  signOut(): void {
    const isBusiness = this._authStore.isBusinessLoggedIn();
    const isUser = this._authStore.isUserLoggedIn();

    if (isBusiness) {
      this._business.logOut().subscribe((status) => {
        if (status) this.removeUser(true);
      });
      return;
    }
    if (isUser) {
      this._user.logOut().subscribe((status) => {
        if (status) this.removeUser(true);
      });
      return;
    }
  }

  async handleSuccessLogin(
    loggedUser?: UserSchema | null,
    loggedBusiness?: BusinessSchema | null,
    isNewAccount?: boolean,
  ): Promise<void> {
    this._storageService.set('loggedUser', true);
    const sessionType = loggedBusiness ? 'business' : 'user';
    this._storageService.set('sessionType', sessionType);

    if (loggedBusiness) {
      this.setBusiness(loggedBusiness);
      this._notifyAuthSuccess(
        this._displayName(loggedBusiness.name),
        isNewAccount ? 'auth.businessCreated' : null,
      );
      if (isNewAccount) {
        this._storageService.set(
          AuthService.BUSINESS_ONBOARDING_PENDING_KEY,
          true,
        );
        this._utilsService.navigate([
          AppConfigService.config.routes.dashboard,
          AppConfigService.config.routes.setup,
          AppConfigService.config.routes.edit,
        ]);
      } else {
        this._storageService.remove(AuthService.BUSINESS_ONBOARDING_PENDING_KEY);
        this._utilsService.navigate([AppConfigService.config.routes.dashboard]);
      }
    } else if (loggedUser) {
      this.setUser(loggedUser);
      this._notifyAuthSuccess(
        this._displayName(loggedUser.firstName, loggedUser.lastName),
        isNewAccount ? 'auth.userCreated' : null,
      );
      this._storageService.remove(AuthService.BUSINESS_ONBOARDING_PENDING_KEY);
      this._utilsService.navigate([AppConfigService.config.routes.profile]);
    }
  }

  /** Toast de bienvenida; si hay alta nueva, también el de creación exitosa. */
  private _notifyAuthSuccess(
    name: string,
    createdKey: 'auth.userCreated' | 'auth.businessCreated' | null,
  ): void {
    if (createdKey) {
      this._toast.success(createdKey);
    }
    if (name) {
      this._toast.success('auth.welcomeNamed', { name });
    }
  }

  private _displayName(...parts: Array<string | null | undefined>): string {
    return parts
      .map((part) => part?.trim())
      .filter((part): part is string => !!part)
      .join(' ');
  }

  async encryptTokens(tokens: any): Promise<string> {
    return await this._encryptionService.encrypt(
      JSON.stringify(tokens),
      environment.crypto.secret,
    );
  }

  async decryptTokens(token: string): Promise<any> {
    const decryptedBytes = await this._encryptionService.decrypt(
      token,
      environment.crypto.secret,
    );
    return JSON.parse(decryptedBytes);
  }

  setUser(user: UserSchema) {
    this._authStore.setUser(user);
  }

  setBusiness(business: BusinessSchema) {
    this._authStore.setBusiness(business);
  }

  removeUser(redirect?: boolean): void {
    if (isPlatformBrowser(this._platformId)) {
      this._notificationsSocket.disconnect();
      this._authStore.clearAuth();
      this._storageService.remove('loggedUser');
      this._storageService.remove('sessionType');
      if (redirect) {
        this._utilsService.navigate([AppConfigService.config.routes.login]);
      }
    }
  }

  /** Tipo de sesión actual (store o storage tras refresh). */
  getSessionType(): 'user' | 'business' | null {
    const fromStore = this._authStore.sessionType?.();
    if (fromStore) return fromStore;
    const fromStorage = this._storageService.get('sessionType');
    return fromStorage === 'user' || fromStorage === 'business'
      ? fromStorage
      : null;
  }
}
