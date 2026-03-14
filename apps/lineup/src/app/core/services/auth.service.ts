import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

import {
  ApiService,
  AppConfigService,
  AuthStore,
  BusinessSchema,
  BusinessService,
  EncryptionService,
  StorageService,
  UserSchema,
  UserService,
  UtilsService,
} from '@lineup/core';
import { environment } from '@lineup/envs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _api = inject(ApiService);
  private _authStore = inject(AuthStore);
  private _utilsService = inject(UtilsService);
  private _storageService = inject(StorageService);
  private _encryptionService = inject(EncryptionService);
  private _platformId = inject(PLATFORM_ID);
  private _user = inject(UserService);
  private _business = inject(BusinessService);

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this._platformId)) {
      return this._storageService.get('loggedUser') ? true : false;
    } else {
      return false;
    }
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

  // login(data: any): Observable<any> {
  //   return this._api.post('auth/login', data);
  // }

  // loginWithGoogle(credentials: SocialAuth): Observable<AuthResponse> {
  //   return this._api.post(app, 'auth/google/login', credentials);
  // }

  // registerWithGoogle(credentials: RegisterGoogleDto): Observable<AuthResponse> {
  //   return this._api.post(app, 'auth/google/register', credentials);
  // }

  // logOut() {
  //   return this._api.post('auth/logout');
  // }

  //   sendEmailCode(
  //     email: string,
  //
  //   ): Observable<any> {
  //     return this._api.post(app, 'auth/send-email-code', { email });
  //   }

  //   validateEmailCode(
  //     email: string,
  //     code: string,
  //
  //   ): Observable<AuthResponse> {
  //     return this._api.put(app, `auth/validate-email/${code}`, { email });
  //   }

  // async handleTokens(loggedUser: any) {
  //   const tokens = {
  //     token: loggedUser.token,
  //     refreshToken: loggedUser.refreshToken,
  //   };
  //   this._store.dispatch(SetTokens({ tokens }));
  //   const encryptedTokens = await this.encryptTokens(tokens);
  //   this._storageService.set('accessToken', encryptedTokens);
  // }

  async handleSuccessLogin(
    loggedUser?: UserSchema,
    loggedBusiness?: BusinessSchema,
    newUser?: boolean,
  ): Promise<void> {
    this._storageService.set('loggedUser', true);
    const sessionType = loggedBusiness ? 'business' : 'user';
    this._storageService.set('sessionType', sessionType);

    if (loggedBusiness) {
      this.setBusiness(loggedBusiness);
      if (newUser) {
        this._utilsService.navigate([
          AppConfigService.config.routes.dashboard,
          AppConfigService.config.routes.edit,
        ]);
      } else {
        this._utilsService.navigate([AppConfigService.config.routes.dashboard]);
      }
    } else if (loggedUser) {
      this.setUser(loggedUser);
      this._utilsService.navigate([AppConfigService.config.routes.profile]);
    }

    // if (
    //   loggedUser.user.roles.some((role) => role === RolesCodesEnum.BUSINESS)
    // ) {
    //   if (
    //     newUser ||
    //     loggedUser.user.representativeLegalBusinesses.length === 0
    //   ) {
    //     setTimeout(() => {
    //       this._utilsService.navigate([
    //         AppConfigService.config.routes.dashboard,
    //         AppConfigService.config.routes.business,
    //         AppConfigService.config.routes.myProfile,
    //       ]);
    //     }, 200);
    //   } else {
    //     setTimeout(() => {
    //       this._utilsService.navigate([
    //         AppConfigService.config.routes.dashboard,
    //         AppConfigService.config.routes.business,
    //       ]);
    //     }, 200);
    //   }
    // } else if (
    //   loggedUser.user.roles.some((role) => role === RolesCodesEnum.PROFESSIONAL)
    // ) {
    //   if (newUser) {
    //     setTimeout(() => {
    //       this._utilsService.navigate([
    //         AppConfigService.config.routes.dashboard,
    //         AppConfigService.config.routes.myProfile,
    //       ]);
    //     }, 200);
    //   } else {
    //     setTimeout(() => {
    //       this._utilsService.navigate([
    //         AppConfigService.config.routes.dashboard,
    //       ]);
    //     }, 200);
    //   }
    // } else {
    //   setTimeout(() => {
    //     this._utilsService.navigate([
    //       AppConfigService.config.routes.dashboard,
    //       AppConfigService.config.routes.user,
    //     ]);
    //   }, 200);
    // }
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
