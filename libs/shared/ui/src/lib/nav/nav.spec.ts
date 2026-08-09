import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  AuthStore,
  BusinessNotificationsPrivateService,
  NotificationsSocketService,
  UserNotificationsPublicService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { Nav } from './nav';

describe('Nav', () => {
  let component: Nav;
  let fixture: ComponentFixture<Nav>;
  let authStore: {
    isUserLoggedIn: jest.Mock;
    isBusinessLoggedIn: jest.Mock;
    user: jest.Mock;
    business: jest.Mock;
  };
  let userNotifications: { unreadNotificationsCount: jest.Mock };
  let socketService: {
    notification$: Subject<unknown>;
    connect: jest.Mock;
    disconnect: jest.Mock;
  };

  beforeEach(async () => {
    authStore = {
      isUserLoggedIn: jest.fn(() => true),
      isBusinessLoggedIn: jest.fn(() => false),
      user: jest.fn(() => ({ id: 10 })),
      business: jest.fn((): null => null),
    };

    userNotifications = {
      unreadNotificationsCount: jest.fn(() => of(4)),
    };

    socketService = {
      notification$: new Subject(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Nav, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthStore, useValue: authStore },
        {
          provide: UserNotificationsPublicService,
          useValue: {
            ...userNotifications,
            myNotifications: jest.fn(() => of({ items: [], total: 0 })),
          },
        },
        {
          provide: BusinessNotificationsPrivateService,
          useValue: {
            unreadBusinessNotificationsCount: jest.fn(() => of(0)),
            myBusinessNotifications: jest.fn(() => of({ items: [], total: 0 })),
          },
        },
        {
          provide: NotificationsSocketService,
          useValue: socketService,
        },
        TranslateService,
        TranslateStore,
      ],
    })
      .overrideComponent(Nav, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(Nav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe considerar logged true con sesión de usuario', () => {
    expect(component.logged()).toBe(true);
    expect(component.businessMode()).toBe(false);
  });

  it('debe emitir sidebarToggle al invocar emitSidebarToggle', () => {
    jest.spyOn(component.sidebarToggle, 'emit');
    component.emitSidebarToggle();
    expect(component.sidebarToggle.emit).toHaveBeenCalled();
  });

  it('debe refrescar el contador de notificaciones pendientes', () => {
    component.refreshPendingNotificationsCount();
    expect(userNotifications.unreadNotificationsCount).toHaveBeenCalled();
    expect(component.pendingNotificationsCount()).toBe(4);
  });

  it('debe conectar el socket al crear con usuario autenticado', () => {
    expect(socketService.connect).toHaveBeenCalledWith('user', 10);
  });

  it('debe refrescar contador en modo negocio', () => {
    authStore.isBusinessLoggedIn.mockReturnValue(true);
    authStore.business.mockReturnValue({ id: 99 });
    component.refreshPendingNotificationsCount();
    expect(component.pendingNotificationsCount()).toBeDefined();
  });

  it('debe poner contador en 0 si falla refresh', () => {
    userNotifications.unreadNotificationsCount.mockReturnValue({
      subscribe: ({ error }: { error: () => void }) => error(),
    });
    component.refreshPendingNotificationsCount();
    expect(component.pendingNotificationsCount()).toBe(0);
  });

  it('debe refrescar contador al recibir notificación por socket', () => {
    userNotifications.unreadNotificationsCount.mockReturnValue(of(7));
    socketService.notification$.next({});
    expect(component.pendingNotificationsCount()).toBe(7);
  });
});

describe('Nav sin sesión', () => {
  let component: Nav;
  let fixture: ComponentFixture<Nav>;
  let socketService: {
    notification$: Subject<unknown>;
    connect: jest.Mock;
    disconnect: jest.Mock;
  };
  let userNotifications: { unreadNotificationsCount: jest.Mock };

  beforeEach(async () => {
    userNotifications = {
      unreadNotificationsCount: jest.fn(() => of(5)),
    };
    socketService = {
      notification$: new Subject(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Nav, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: AuthStore,
          useValue: {
            isUserLoggedIn: jest.fn(() => false),
            isBusinessLoggedIn: jest.fn(() => false),
            user: jest.fn((): null => null),
            business: jest.fn((): null => null),
          },
        },
        {
          provide: UserNotificationsPublicService,
          useValue: {
            ...userNotifications,
            myNotifications: jest.fn(() => of({ items: [], total: 0 })),
          },
        },
        {
          provide: BusinessNotificationsPrivateService,
          useValue: {
            unreadBusinessNotificationsCount: jest.fn(() => of(0)),
            myBusinessNotifications: jest.fn(() => of({ items: [], total: 0 })),
          },
        },
        { provide: NotificationsSocketService, useValue: socketService },
        TranslateService,
        TranslateStore,
      ],
    })
      .overrideComponent(Nav, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(Nav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe desconectar socket y poner contador en 0', () => {
    expect(component.logged()).toBe(false);
    expect(component.pendingNotificationsCount()).toBe(0);
    expect(socketService.disconnect).toHaveBeenCalled();
    expect(socketService.connect).not.toHaveBeenCalled();
  });

  it('debe poner contador en 0 si falla la carga inicial', () => {
    userNotifications.unreadNotificationsCount.mockReturnValue({
      subscribe: ({ error }: { error: () => void }) => error(),
    });
    fixture = TestBed.createComponent(Nav);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.pendingNotificationsCount()).toBe(0);
  });
});

describe('Nav modo negocio', () => {
  let component: Nav;
  let fixture: ComponentFixture<Nav>;
  let businessNotifications: { unreadBusinessNotificationsCount: jest.Mock };
  let socketService: {
    connect: jest.Mock;
    notification$: Subject<unknown>;
    disconnect: jest.Mock;
  };

  beforeEach(async () => {
    businessNotifications = {
      unreadBusinessNotificationsCount: jest.fn(() => of(12)),
    };
    socketService = {
      connect: jest.fn(),
      notification$: new Subject(),
      disconnect: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Nav, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: AuthStore,
          useValue: {
            isUserLoggedIn: jest.fn(() => false),
            isBusinessLoggedIn: jest.fn(() => true),
            user: jest.fn((): null => null),
            business: jest.fn(() => ({ id: 55 })),
          },
        },
        {
          provide: UserNotificationsPublicService,
          useValue: {
            unreadNotificationsCount: jest.fn(() => of(0)),
            myNotifications: jest.fn(() => of({ items: [], total: 0 })),
          },
        },
        {
          provide: BusinessNotificationsPrivateService,
          useValue: {
            ...businessNotifications,
            myBusinessNotifications: jest.fn(() => of({ items: [], total: 0 })),
          },
        },
        { provide: NotificationsSocketService, useValue: socketService },
        TranslateService,
        TranslateStore,
      ],
    })
      .overrideComponent(Nav, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(Nav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe conectar socket como negocio y cargar contador', () => {
    expect(component.businessMode()).toBe(true);
    expect(socketService.connect).toHaveBeenCalledWith('business', 55);
    expect(component.pendingNotificationsCount()).toBe(12);
  });

  it('debe refrescar contador de negocio', () => {
    businessNotifications.unreadBusinessNotificationsCount.mockReturnValue(of(20));
    component.refreshPendingNotificationsCount();
    expect(component.pendingNotificationsCount()).toBe(20);
  });

  it('debe poner contador en 0 si falla refresh de negocio', () => {
    businessNotifications.unreadBusinessNotificationsCount.mockReturnValue({
      subscribe: ({ error }: { error: () => void }) => error(),
    });
    component.refreshPendingNotificationsCount();
    expect(component.pendingNotificationsCount()).toBe(0);
  });
});
