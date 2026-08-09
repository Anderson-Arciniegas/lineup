import { TestBed } from '@angular/core/testing';
import type { BusinessSchema, UserSchema } from '@lineup/core';
import { AdminSessionStore } from './admin-session.store';

describe('AdminSessionStore', () => {
  const mockUser = { id: 1, email: 'admin@test.com' } as UserSchema;
  const mockBusiness = { id: 2, name: 'Biz' } as BusinessSchema;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminSessionStore],
    });
    TestBed.inject(AdminSessionStore).clearAdminSession();
  });

  it('setAdminUser sets user session and clears business', () => {
    const store = TestBed.inject(AdminSessionStore);
    store.setAdminUser(mockUser);
    expect(store.user()).toEqual(mockUser);
    expect(store.business()).toBeNull();
    expect(store.isAuthenticated()).toBe(true);
    expect(store.adminSessionType()).toBe('user');
    expect(store.isAdminUserLoggedIn()).toBe(true);
    expect(store.isAdminBusinessLoggedIn()).toBe(false);
  });

  it('setAdminBusiness sets business session and clears user', () => {
    const store = TestBed.inject(AdminSessionStore);
    store.setAdminBusiness(mockBusiness);
    expect(store.business()).toEqual(mockBusiness);
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(true);
    expect(store.adminSessionType()).toBe('business');
    expect(store.isAdminBusinessLoggedIn()).toBe(true);
  });

  it('adminCurrentAccount returns business or user', () => {
    const store = TestBed.inject(AdminSessionStore);
    store.setAdminUser(mockUser);
    expect(store.adminCurrentAccount()).toEqual(mockUser);
    store.setAdminBusiness(mockBusiness);
    expect(store.adminCurrentAccount()).toEqual(mockBusiness);
  });

  it('unsetAdminUser and unsetAdminBusiness update auth state', () => {
    const store = TestBed.inject(AdminSessionStore);
    store.setAdminUser(mockUser);
    store.unsetAdminUser();
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);

    store.setAdminBusiness(mockBusiness);
    store.unsetAdminBusiness();
    expect(store.business()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('clearAdminSession resets all state', () => {
    const store = TestBed.inject(AdminSessionStore);
    store.setAdminUser(mockUser);
    store.clearAdminSession();
    expect(store.user()).toBeNull();
    expect(store.business()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.adminSessionType()).toBeNull();
  });
});
