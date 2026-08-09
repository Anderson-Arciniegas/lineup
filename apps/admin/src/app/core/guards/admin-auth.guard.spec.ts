import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { AdminSessionStore } from '../../store/admin-session.store';
import { ADMIN_ROUTE_SEGMENTS } from '../admin-routes';
import { AuthAdminService } from '../services/auth-admin.service';
import { adminAuthGuard } from './admin-auth.guard';

describe('adminAuthGuard', () => {
  let createUrlTree: jest.Mock;

  beforeEach(() => {
    createUrlTree = jest.fn((commands: unknown[]) => ({ commands }));
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() => adminAuthGuard({} as never, {} as never));
  }

  it('allows access when admin user is in store', () => {
    TestBed.configureTestingModule({
      providers: [
        AdminSessionStore,
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: AuthAdminService,
          useValue: { isLoggedIn: () => false, getMe: jest.fn() },
        },
      ],
    });
    TestBed.inject(AdminSessionStore).setAdminUser({ id: 1 } as never);

    expect(runGuard()).toBe(true);
  });

  it('allows access when business session is in store', () => {
    TestBed.configureTestingModule({
      providers: [
        AdminSessionStore,
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: AuthAdminService,
          useValue: { isLoggedIn: () => false, getMe: jest.fn() },
        },
      ],
    });
    TestBed.inject(AdminSessionStore).setAdminBusiness({ id: 1 } as never);

    expect(runGuard()).toBe(true);
  });

  it('redirects to login when not logged in', () => {
    TestBed.configureTestingModule({
      providers: [
        AdminSessionStore,
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: AuthAdminService,
          useValue: { isLoggedIn: () => false, getMe: jest.fn() },
        },
      ],
    });

    const result = runGuard();
    expect(isObservable(result)).toBe(false);
    expect(createUrlTree).toHaveBeenCalledWith(['/', ADMIN_ROUTE_SEGMENTS.login]);
  });

  it('allows business session from storage without me call', () => {
    TestBed.configureTestingModule({
      providers: [
        AdminSessionStore,
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: AuthAdminService,
          useValue: {
            isLoggedIn: () => true,
            getSessionType: () => 'business',
            getMe: jest.fn(),
          },
        },
      ],
    });

    expect(runGuard()).toBe(true);
  });

  it('validates user session via getMe', async () => {
    TestBed.configureTestingModule({
      providers: [
        AdminSessionStore,
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: AuthAdminService,
          useValue: {
            isLoggedIn: () => true,
            getSessionType: () => 'user',
            getMe: () => of({ id: 1 }),
            clearLocalAdminSession: jest.fn(),
          },
        },
      ],
    });

    await expect(firstValueFrom(runGuard() as never)).resolves.toBe(true);
  });

  it('redirects to login when getMe returns empty user', async () => {
    const clearLocalAdminSession = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        AdminSessionStore,
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: AuthAdminService,
          useValue: {
            isLoggedIn: () => true,
            getSessionType: () => 'user',
            getMe: () => of(null),
            clearLocalAdminSession,
          },
        },
      ],
    });

    await firstValueFrom(runGuard() as never);
    expect(clearLocalAdminSession).toHaveBeenCalled();
    expect(createUrlTree).toHaveBeenCalledWith(['/', ADMIN_ROUTE_SEGMENTS.login]);
  });

  it('redirects to login when getMe fails', async () => {
    const clearLocalAdminSession = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        AdminSessionStore,
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: AuthAdminService,
          useValue: {
            isLoggedIn: () => true,
            getSessionType: () => 'user',
            getMe: () => throwError(() => new Error('network')),
            clearLocalAdminSession,
          },
        },
      ],
    });

    await firstValueFrom(runGuard() as never);
    expect(clearLocalAdminSession).toHaveBeenCalled();
    expect(createUrlTree).toHaveBeenCalledWith(['/', ADMIN_ROUTE_SEGMENTS.login]);
  });
});
