import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BROWSER_STORAGE, StorageService } from '@lineup/core';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of, throwError } from 'rxjs';
import { createApolloMock, createMemoryStorageMock } from '../../../testing';
import { AdminSessionStore } from '../../store/admin-session.store';
import {
  ADMIN_LOGGED_STORAGE_KEY,
  ADMIN_SESSION_TYPE_STORAGE_KEY,
} from '../constants/admin-storage-keys';
import { AuthAdminService } from './auth-admin.service';

describe('AuthAdminService', () => {
  let service: AuthAdminService;
  let mutateSpy: jest.Mock;
  let querySpy: jest.Mock;
  let storage: Storage;
  let navigate: jest.Mock;

  function setup(options?: {
    platformId?: string;
    mutate?: jest.Mock;
    query?: jest.Mock;
  }) {
    TestBed.resetTestingModule();
    storage = createMemoryStorageMock();
    navigate = jest.fn();
    const apollo = createApolloMock({
      mutate:
        options?.mutate ??
        jest.fn(() =>
          of({
            data: {
              login: { status: true, user: { id: 1 } },
              logout: { status: true },
            },
          }),
        ),
      query:
        options?.query ??
        jest.fn(() => of({ data: { me: { id: 1, email: 'a@test.com' } } })),
    });
    mutateSpy = apollo.mutateSpy;
    querySpy = apollo.querySpy;

    TestBed.configureTestingModule({
      providers: [
        AuthAdminService,
        AdminSessionStore,
        StorageService,
        { provide: Apollo, useValue: apollo.mock },
        { provide: BROWSER_STORAGE, useValue: storage },
        { provide: Router, useValue: { navigate } },
        { provide: PLATFORM_ID, useValue: options?.platformId ?? 'browser' },
      ],
    });
    service = TestBed.inject(AuthAdminService);
    TestBed.inject(AdminSessionStore).clearAdminSession();
  }

  beforeEach(() => {
    setup();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login calls Apollo and hydrates user on success', async () => {
    const result = await firstValueFrom(service.login('a@test.com', 'pass'));
    expect(result.status).toBe(true);
    expect(mutateSpy).toHaveBeenCalled();
    expect(querySpy).toHaveBeenCalled();
  });

  it('login returns failed response without fetching me', async () => {
    setup({
      mutate: jest.fn(() => of({ data: { login: { status: false } } })),
    });
    const result = await firstValueFrom(service.login('a@test.com', 'bad'));
    expect(result.status).toBe(false);
    expect(querySpy).not.toHaveBeenCalled();
  });

  it('login with business session skips me fetch', async () => {
    setup({
      mutate: jest.fn(() =>
        of({ data: { login: { status: true, business: { id: 2 } } } }),
      ),
    });
    await firstValueFrom(service.login('biz@test.com', 'pass'));
    expect(querySpy).not.toHaveBeenCalled();
    expect(TestBed.inject(AdminSessionStore).business()).toEqual({ id: 2 });
  });

  it('logout clears session', async () => {
    service.handleSuccessLogin({ id: 1 } as never);
    await firstValueFrom(service.logout());
    expect(service.isLoggedIn()).toBe(false);
    expect(TestBed.inject(AdminSessionStore).user()).toBeNull();
  });

  it('isLoggedIn reads storage flag in browser', () => {
    expect(service.isLoggedIn()).toBe(false);
    service.handleSuccessLogin({ id: 1 } as never);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('isLoggedIn returns false on server platform', () => {
    setup({ platformId: 'server' });
    storage.setItem(ADMIN_LOGGED_STORAGE_KEY, JSON.stringify(true));
    expect(service.isLoggedIn()).toBe(false);
  });

  it('handleSuccessLogin with business stores business session', () => {
    service.handleSuccessLogin(undefined, { id: 9 } as never);
    expect(TestBed.inject(AdminSessionStore).business()).toEqual({ id: 9 });
    expect(storage.getItem(ADMIN_SESSION_TYPE_STORAGE_KEY)).toBe(
      JSON.stringify('business'),
    );
    expect(navigate).toHaveBeenCalled();
  });

  it('handleSuccessLogin is noop on server platform', () => {
    setup({ platformId: 'server' });
    service.handleSuccessLogin({ id: 1 } as never);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('getSessionType returns store value first', () => {
    TestBed.inject(AdminSessionStore).setAdminUser({ id: 1 } as never);
    expect(service.getSessionType()).toBe('user');
  });

  it('getSessionType falls back to storage', () => {
    storage.setItem(ADMIN_SESSION_TYPE_STORAGE_KEY, JSON.stringify('business'));
    expect(service.getSessionType()).toBe('business');
  });

  it('getSessionType returns null for invalid storage value', () => {
    storage.setItem(ADMIN_SESSION_TYPE_STORAGE_KEY, JSON.stringify('invalid'));
    expect(service.getSessionType()).toBeNull();
  });

  it('clearLocalAdminSession clears store and storage', () => {
    service.handleSuccessLogin({ id: 1 } as never);
    service.clearLocalAdminSession();
    expect(service.isLoggedIn()).toBe(false);
    expect(TestBed.inject(AdminSessionStore).isAuthenticated()).toBe(false);
  });

  it('signOut navigates to login on success', () => {
    service.signOut(true);
    expect(navigate).toHaveBeenCalledWith(['/', 'login']);
  });

  it('signOut clears session and navigates on error', () => {
    setup({
      mutate: jest.fn(() => throwError(() => new Error('logout failed'))),
    });
    service.handleSuccessLogin({ id: 1 } as never);
    service.signOut(true);
    expect(service.isLoggedIn()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/', 'login']);
  });

  it('signOut can skip redirect', () => {
    service.signOut(false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
