import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  ApiService,
  AppConfigService,
  AppState,
  EncryptionService,
  SetTokens,
  SetUser,
  StorageService,
  UnsetUser,
  UtilsService,
} from '@lineup/core';
import { environment } from 'apps/lineup/src/environment/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _api = inject(ApiService);
  private _store = inject(Store<AppState>);
  private _utilsService = inject(UtilsService);
  private _storageService = inject(StorageService);
  private _encryptionService = inject(EncryptionService);
  private _platformId = inject(PLATFORM_ID);

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this._platformId)) {
      return this._storageService.get('loggedUser') ? true : false;
    } else {
      return false;
    }
  }

  login(data: any): Observable<any> {
    return this._api.post('auth/login', data);
  }

  // loginWithGoogle(credentials: SocialAuth): Observable<AuthResponse> {
  //   return this._api.post(app, 'auth/google/login', credentials);
  // }

  // registerWithGoogle(credentials: RegisterGoogleDto): Observable<AuthResponse> {
  //   return this._api.post(app, 'auth/google/register', credentials);
  // }

  logOut() {
    return this._api.post('auth/logout');
  }

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

  async handleTokens(loggedUser: any) {
    const tokens = {
      token: loggedUser.token,
      refreshToken: loggedUser.refreshToken,
    };
    this._store.dispatch(SetTokens({ tokens }));
    const encryptedTokens = await this.encryptTokens(tokens);
    this._storageService.set('accessToken', encryptedTokens);
  }

  async handleSuccessLogin(loggedUser: any, newUser?: boolean) {
    this._storageService.set('loggedUser', true);
    await this.handleTokens(loggedUser);
    this.setUser(loggedUser.user);
    this._utilsService.navigate([AppConfigService.config.routes.controlPanel]);
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

  setUser(user: any) {
    this._store.dispatch(SetUser({ user }));
  }

  removeUser(redirect?: boolean) {
    if (isPlatformBrowser(this._platformId)) {
      this._store.dispatch(UnsetUser());
      this._storageService.remove('loggedUser');
      if (redirect) {
        this._utilsService.navigate([AppConfigService.config.routes.login]);
      }
    }
  }
}
