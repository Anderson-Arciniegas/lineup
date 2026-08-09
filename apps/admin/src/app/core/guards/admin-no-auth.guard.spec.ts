import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ADMIN_ROUTE_SEGMENTS } from '../admin-routes';
import { AuthAdminService } from '../services/auth-admin.service';
import { adminNoAuthGuard } from './admin-no-auth.guard';

describe('adminNoAuthGuard', () => {
  let createUrlTree: jest.Mock;

  beforeEach(() => {
    createUrlTree = jest.fn((commands: unknown[]) => ({ commands }));
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() => adminNoAuthGuard({} as never, {} as never));
  }

  it('allows guests without session', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: AuthAdminService,
          useValue: { isLoggedIn: () => false },
        },
      ],
    });

    expect(runGuard()).toBe(true);
  });

  it('redirects logged-in users to dashboard', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: AuthAdminService,
          useValue: { isLoggedIn: () => true },
        },
      ],
    });

    const result = runGuard();
    expect(createUrlTree).toHaveBeenCalledWith(['/', ADMIN_ROUTE_SEGMENTS.dashboard]);
    expect(result).toBeTruthy();
  });
});
