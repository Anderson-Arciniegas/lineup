import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { initialAuthState } from './auth.state';
import type { BusinessSchema, UserSchema } from '../../schemas';

describe('AuthStore', () => {
  const mockUser = { id: 1, email: 'u@test.com' } as UserSchema;
  const mockBusiness = { id: 2, name: 'Biz' } as BusinessSchema;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthStore],
    });
    const store = TestBed.inject(AuthStore);
    store.clearAuth();
  });

  it('setUser sets user session and clears business', () => {
    const store = TestBed.inject(AuthStore);
    store.setUser(mockUser);
    expect(store.user()).toEqual(mockUser);
    expect(store.business()).toBeNull();
    expect(store.isAuthenticated()).toBe(true);
    expect(store.sessionType()).toBe('user');
    expect(store.isUserLoggedIn()).toBe(true);
    expect(store.isBusinessLoggedIn()).toBe(false);
  });

  it('setBusiness sets business session and clears user', () => {
    const store = TestBed.inject(AuthStore);
    store.setBusiness(mockBusiness);
    expect(store.business()).toEqual(mockBusiness);
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(true);
    expect(store.sessionType()).toBe('business');
    expect(store.isBusinessLoggedIn()).toBe(true);
  });

  it('currentAccount returns business or user', () => {
    const store = TestBed.inject(AuthStore);
    store.setUser(mockUser);
    expect(store.currentAccount()).toEqual(mockUser);
    store.setBusiness(mockBusiness);
    expect(store.currentAccount()).toEqual(mockBusiness);
  });

  it('unsetUser and unsetBusiness update auth state', () => {
    const store = TestBed.inject(AuthStore);
    store.setUser(mockUser);
    store.unsetUser();
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);

    store.setBusiness(mockBusiness);
    store.unsetBusiness();
    expect(store.business()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('clearAuth resets all state', () => {
    const store = TestBed.inject(AuthStore);
    store.setUser(mockUser);
    store.clearAuth();
    expect(store.user()).toBeNull();
    expect(store.business()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.sessionType()).toBeNull();
  });

  it('initialAuthState matches cleared store defaults', () => {
    const store = TestBed.inject(AuthStore);
    expect({
      user: store.user(),
      business: store.business(),
      isAuthenticated: store.isAuthenticated(),
    }).toEqual(initialAuthState);
  });
});
