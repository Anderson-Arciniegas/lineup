import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AppConfigService,
  ApiService,
  AuthStore,
  BusinessPrivateService,
  BusinessSchema,
  EncryptionService,
  NotificationsSocketService,
  StorageService,
  ToastService,
  UserPublicService,
  UserSchema,
  UtilsService,
} from '@lineup/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let storageGet: jest.Mock;
  let storageSet: jest.Mock;
  let storageRemove: jest.Mock;
  let toastSuccess: jest.Mock;
  let authStore: {
    user: jest.Mock;
    business: jest.Mock;
    isBusinessLoggedIn: jest.Mock;
    isUserLoggedIn: jest.Mock;
    sessionType: jest.Mock;
    setUser: jest.Mock;
    setBusiness: jest.Mock;
    clearAuth: jest.Mock;
  };
  let navigate: jest.Mock;
  let encrypt: jest.Mock;
  let decrypt: jest.Mock;
  let logOutBusiness: jest.Mock;
  let logOutUser: jest.Mock;
  let getMe: jest.Mock;
  let myBusiness: jest.Mock;
  let refreshUserToken: jest.Mock;
  let refreshBusinessToken: jest.Mock;
  let disconnect: jest.Mock;

  beforeEach(() => {
    storageGet = jest.fn();
    storageSet = jest.fn();
    storageRemove = jest.fn();
    toastSuccess = jest.fn();
    navigate = jest.fn();
    encrypt = jest.fn().mockResolvedValue('encrypted-token');
    decrypt = jest.fn().mockResolvedValue('{"accessToken":"abc"}');
    logOutBusiness = jest.fn(() => of(true));
    logOutUser = jest.fn(() => of(true));
    getMe = jest.fn(() => of(null));
    myBusiness = jest.fn(() => of(null));
    refreshUserToken = jest.fn(() => of({}));
    refreshBusinessToken = jest.fn(() => of({}));
    disconnect = jest.fn();
    authStore = {
      user: jest.fn(() => null),
      business: jest.fn(() => null),
      isBusinessLoggedIn: jest.fn(() => false),
      isUserLoggedIn: jest.fn(() => false),
      sessionType: jest.fn(() => null),
      setUser: jest.fn(),
      setBusiness: jest.fn(),
      clearAuth: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: {} },
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: StorageService,
          useValue: { get: storageGet, set: storageSet, remove: storageRemove },
        },
        { provide: AuthStore, useValue: authStore },
        { provide: UtilsService, useValue: { navigate } },
        {
          provide: EncryptionService,
          useValue: { encrypt, decrypt },
        },
        {
          provide: UserPublicService,
          useValue: {
            logOut: logOutUser,
            getMe,
            refreshToken: refreshUserToken,
          },
        },
        {
          provide: BusinessPrivateService,
          useValue: {
            logOut: logOutBusiness,
            myBusiness,
            refreshToken: refreshBusinessToken,
          },
        },
        {
          provide: NotificationsSocketService,
          useValue: { disconnect },
        },
        { provide: ToastService, useValue: { success: toastSuccess } },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  describe('isLoggedIn', () => {
    it('debe devolver true si hay loggedUser en storage (browser)', () => {
      storageGet.mockReturnValue(true);
      expect(service.isLoggedIn()).toBe(true);
      expect(storageGet).toHaveBeenCalledWith('loggedUser');
    });

    it('debe devolver false si no hay loggedUser en storage', () => {
      storageGet.mockReturnValue(null);
      expect(service.isLoggedIn()).toBe(false);
    });

    it('debe devolver false en SSR', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: ApiService, useValue: {} },
          { provide: PLATFORM_ID, useValue: 'server' },
          {
            provide: StorageService,
            useValue: { get: storageGet, set: storageSet, remove: storageRemove },
          },
          { provide: AuthStore, useValue: authStore },
          { provide: UtilsService, useValue: { navigate } },
          { provide: EncryptionService, useValue: { encrypt, decrypt } },
          { provide: UserPublicService, useValue: { logOut: logOutUser } },
          { provide: BusinessPrivateService, useValue: { logOut: logOutBusiness } },
          { provide: NotificationsSocketService, useValue: { disconnect } },
          { provide: ToastService, useValue: { success: toastSuccess } },
        ],
      });
      const ssrService = TestBed.inject(AuthService);
      storageGet.mockReturnValue(true);
      expect(ssrService.isLoggedIn()).toBe(false);
    });
  });

  describe('signOut', () => {
    it('debe cerrar sesión de negocio y limpiar usuario', () => {
      authStore.isBusinessLoggedIn.mockReturnValue(true);
      service.signOut();
      expect(logOutBusiness).toHaveBeenCalled();
      expect(logOutUser).not.toHaveBeenCalled();
    });

    it('debe cerrar sesión de usuario y limpiar usuario', () => {
      authStore.isUserLoggedIn.mockReturnValue(true);
      service.signOut();
      expect(logOutUser).toHaveBeenCalled();
      expect(logOutBusiness).not.toHaveBeenCalled();
    });
  });

  describe('handleSuccessLogin', () => {
    const user = {
      id: 1,
      email: 'u@test.com',
      firstName: 'Ana',
      lastName: 'López',
    } as UserSchema;
    const business = { id: 2, path: 'shop', name: 'Mi Tienda' } as BusinessSchema;

    it('debe configurar sesión de usuario, dar la bienvenida y navegar al perfil', async () => {
      await service.handleSuccessLogin(user);
      expect(storageSet).toHaveBeenCalledWith('loggedUser', true);
      expect(storageSet).toHaveBeenCalledWith('sessionType', 'user');
      expect(authStore.setUser).toHaveBeenCalledWith(user);
      expect(toastSuccess).toHaveBeenCalledWith('auth.welcomeNamed', {
        name: 'Ana López',
      });
      expect(toastSuccess).not.toHaveBeenCalledWith('auth.userCreated');
      expect(navigate).toHaveBeenCalledWith([
        AppConfigService.config.routes.profile,
      ]);
    });

    it('debe configurar sesión de negocio existente, dar la bienvenida y navegar al dashboard', async () => {
      await service.handleSuccessLogin(undefined, business, false);
      expect(storageSet).toHaveBeenCalledWith('sessionType', 'business');
      expect(authStore.setBusiness).toHaveBeenCalledWith(business);
      expect(storageRemove).toHaveBeenCalledWith('businessOnboardingPending');
      expect(toastSuccess).toHaveBeenCalledWith('auth.welcomeNamed', {
        name: 'Mi Tienda',
      });
      expect(toastSuccess).not.toHaveBeenCalledWith('auth.businessCreated');
      expect(navigate).toHaveBeenCalledWith([
        AppConfigService.config.routes.dashboard,
      ]);
    });

    it('debe marcar onboarding pendiente y avisar creación de negocio nuevo', async () => {
      await service.handleSuccessLogin(undefined, business, true);
      expect(storageSet).toHaveBeenCalledWith('businessOnboardingPending', true);
      expect(toastSuccess).toHaveBeenCalledWith('auth.businessCreated');
      expect(toastSuccess).toHaveBeenCalledWith('auth.welcomeNamed', {
        name: 'Mi Tienda',
      });
      expect(navigate).toHaveBeenCalledWith([
        AppConfigService.config.routes.dashboard,
        AppConfigService.config.routes.setup,
        AppConfigService.config.routes.edit,
      ]);
    });

    it('debe avisar creación de usuario nuevo', async () => {
      await service.handleSuccessLogin(user, null, true);
      expect(toastSuccess).toHaveBeenCalledWith('auth.userCreated');
      expect(toastSuccess).toHaveBeenCalledWith('auth.welcomeNamed', {
        name: 'Ana López',
      });
    });
  });

  describe('encryptTokens / decryptTokens', () => {
    it('debe cifrar tokens como JSON', async () => {
      const tokens = { accessToken: 'abc' };
      const result = await service.encryptTokens(tokens);
      expect(encrypt).toHaveBeenCalled();
      expect(result).toBe('encrypted-token');
    });

    it('debe descifrar y parsear tokens', async () => {
      const result = await service.decryptTokens('cipher');
      expect(decrypt).toHaveBeenCalledWith('cipher', expect.any(String));
      expect(result).toEqual({ accessToken: 'abc' });
    });
  });

  describe('removeUser', () => {
    it('debe limpiar store, storage y desconectar socket', () => {
      service.removeUser(false);
      expect(disconnect).toHaveBeenCalled();
      expect(authStore.clearAuth).toHaveBeenCalled();
      expect(storageRemove).toHaveBeenCalledWith('loggedUser');
      expect(storageRemove).toHaveBeenCalledWith('sessionType');
      expect(navigate).not.toHaveBeenCalled();
    });

    it('debe redirigir a login cuando redirect es true', () => {
      service.removeUser(true);
      expect(navigate).toHaveBeenCalledWith([
        AppConfigService.config.routes.login,
      ]);
    });
  });

  describe('getSessionType', () => {
    it('debe preferir el valor del store', () => {
      authStore.sessionType.mockReturnValue('business');
      expect(service.getSessionType()).toBe('business');
    });

    it('debe leer sessionType del storage si el store está vacío', () => {
      authStore.sessionType.mockReturnValue(null);
      storageGet.mockReturnValue('user');
      expect(service.getSessionType()).toBe('user');
    });

    it('debe devolver null si no hay sesión válida', () => {
      authStore.sessionType.mockReturnValue(null);
      storageGet.mockReturnValue('invalid');
      expect(service.getSessionType()).toBeNull();
    });
  });

  describe('getters', () => {
    it('debe exponer userValue y businessValue del store', () => {
      authStore.user.mockReturnValue({ id: 5 });
      authStore.business.mockReturnValue({ id: 6 });
      expect(service.userValue).toEqual({ id: 5 });
      expect(service.businessValue).toEqual({ id: 6 });
    });
  });

  describe('restoreSession', () => {
    it('no debe consultar APIs si no hay loggedUser', async () => {
      storageGet.mockReturnValue(null);
      await expect(firstValueFrom(service.restoreSession())).resolves.toBe(
        false,
      );
      expect(getMe).not.toHaveBeenCalled();
      expect(myBusiness).not.toHaveBeenCalled();
    });

    it('debe rehidratar solo sesión business', async () => {
      storageGet.mockImplementation((key: string) => {
        if (key === 'loggedUser') return true;
        if (key === 'sessionType') return 'business';
        return null;
      });
      myBusiness.mockReturnValue(of({ id: 9, name: 'Biz' }));

      await expect(firstValueFrom(service.restoreSession())).resolves.toBe(
        true,
      );
      expect(myBusiness).toHaveBeenCalled();
      expect(getMe).not.toHaveBeenCalled();
      expect(authStore.setBusiness).toHaveBeenCalledWith({
        id: 9,
        name: 'Biz',
      });
    });

    it('debe intentar refresh si myBusiness falla', async () => {
      storageGet.mockImplementation((key: string) => {
        if (key === 'loggedUser') return true;
        if (key === 'sessionType') return 'business';
        return null;
      });
      myBusiness
        .mockReturnValueOnce(throwError(() => new Error('expired')))
        .mockReturnValueOnce(of({ id: 11 }));
      refreshBusinessToken.mockReturnValue(of({ id: 11 }));

      await expect(firstValueFrom(service.restoreSession())).resolves.toBe(
        true,
      );
      expect(refreshBusinessToken).toHaveBeenCalled();
      expect(authStore.setBusiness).toHaveBeenCalledWith({ id: 11 });
    });
  });
});
