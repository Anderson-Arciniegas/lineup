import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import {
  BaseResponse,
  BusinessSchema,
  LoginResponse,
  StorageService,
  UserSchema,
} from '@lineup/core';
import { AdminSessionStore } from '../../store/admin-session.store';
import { ADMIN_APOLLO_CLIENT } from '../constants/admin-apollo-client';
import {
  ADMIN_LOGGED_STORAGE_KEY,
  ADMIN_SESSION_TYPE_STORAGE_KEY,
} from '../constants/admin-storage-keys';
import { ADMIN_ROUTE_SEGMENTS } from '../admin-routes';
import {
  ADMIN_LOGIN_MUTATION,
  ADMIN_LOGOUT_MUTATION,
} from '../graphql/mutations/admin-auth.mutations';
import { ADMIN_ME_QUERY } from '../graphql/queries/admin-auth.queries';
import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

/**
 * Autenticación contra el API admin (cookies + `AdminSessionStore`).
 * Flujo similar a lineup: login → persistir flags → hidratar usuario con `me` si aplica.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthAdminService {
  private readonly apollo = inject(Apollo);
  private readonly adminSession = inject(AdminSessionStore);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Login y carga de sesión: aplica `LoginResponse`, y si hay `user` vuelve a pedir `me` (perfil completo).
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.requestLogin(email, password).pipe(
      switchMap((res) => {
        if (!res.status) {
          return of(res);
        }
        this.applyLoginResponse(res);
        if (res.user) {
          return this.fetchMe().pipe(map(() => res));
        }
        return of(res);
      }),
    );
  }

  private requestLogin(
    email: string,
    password: string,
  ): Observable<LoginResponse> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ login: LoginResponse }>({
        mutation: ADMIN_LOGIN_MUTATION,
        variables: { login: { email, password } },
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.login));
  }

  logout(): Observable<boolean> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ logout: BaseResponse }>({
        mutation: ADMIN_LOGOUT_MUTATION,
        context: { withCredentials: true },
      })
      .pipe(
        map((r) => r.data!.logout.status),
        tap(() => this.clearSession()),
      );
  }

  /** Usuario actual del API admin; sincroniza el store. */
  getMe(): Observable<UserSchema> {
    return this.fetchMe();
  }

  private fetchMe(): Observable<UserSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ me: UserSchema }>({
        query: ADMIN_ME_QUERY,
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(
        map((r) => r.data.me),
        tap((user) => {
          if (user) {
            this.adminSession.setAdminUser(user);
            this.persistSessionFlags('user');
          }
        }),
      );
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return this.storage.get(ADMIN_LOGGED_STORAGE_KEY) ? true : false;
  }

  /** Igual que lineup: flags en storage + cuenta en store + navegación al dashboard. */
  handleSuccessLogin(
    loggedUser?: UserSchema,
    loggedBusiness?: BusinessSchema,
  ): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.storage.set(ADMIN_LOGGED_STORAGE_KEY, true);
    const sessionType = loggedBusiness ? 'business' : 'user';
    this.storage.set(ADMIN_SESSION_TYPE_STORAGE_KEY, sessionType);

    if (loggedBusiness) {
      this.adminSession.setAdminBusiness(loggedBusiness);
    } else if (loggedUser) {
      this.adminSession.setAdminUser(loggedUser);
    }

    void this.router.navigate(['/', ADMIN_ROUTE_SEGMENTS.dashboard]);
  }

  signOut(redirectToLogin = true): void {
    this.logout().subscribe({
      next: () => {
        if (redirectToLogin) {
          void this.router.navigate(['/', ADMIN_ROUTE_SEGMENTS.login]);
        }
      },
      error: () => {
        this.clearSession();
        if (redirectToLogin) {
          void this.router.navigate(['/', ADMIN_ROUTE_SEGMENTS.login]);
        }
      },
    });
  }

  /**
   * Limpia store y flags locales sin llamar al API (cookie inválida, `me` vacío, etc.).
   */
  clearLocalAdminSession(): void {
    this.clearSession();
  }

  getSessionType(): 'user' | 'business' | null {
    const fromStore = this.adminSession.adminSessionType();
    if (fromStore) {
      return fromStore;
    }
    const fromStorage = this.storage.get(ADMIN_SESSION_TYPE_STORAGE_KEY);
    return fromStorage === 'user' || fromStorage === 'business'
      ? fromStorage
      : null;
  }

  private applyLoginResponse(res: LoginResponse): void {
    if (!res?.status) {
      return;
    }
    if (res.business) {
      this.adminSession.setAdminBusiness(res.business as BusinessSchema);
      this.persistSessionFlags('business');
      return;
    }
    if (res.user) {
      this.adminSession.setAdminUser(res.user);
      this.persistSessionFlags('user');
    }
  }

  private persistSessionFlags(sessionType: 'user' | 'business'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.storage.set(ADMIN_LOGGED_STORAGE_KEY, true);
    this.storage.set(ADMIN_SESSION_TYPE_STORAGE_KEY, sessionType);
  }

  private clearSession(): void {
    this.adminSession.clearAdminSession();
    if (isPlatformBrowser(this.platformId)) {
      this.storage.remove(ADMIN_LOGGED_STORAGE_KEY);
      this.storage.remove(ADMIN_SESSION_TYPE_STORAGE_KEY);
    }
  }
}
