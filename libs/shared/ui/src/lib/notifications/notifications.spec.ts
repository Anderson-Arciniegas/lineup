import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  BusinessNotificationsPrivateService,
  NotificationTypeEnum,
  NotificationsSocketService,
  UserNotificationsPublicService,
  type NotificationSchema,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { Notifications } from './notifications';

describe('Notifications', () => {
  let component: Notifications;
  let fixture: ComponentFixture<Notifications>;
  let publicService: {
    myNotifications: jest.Mock;
    markNotificationRead: jest.Mock;
    markAllNotificationsRead: jest.Mock;
  };
  let privateService: {
    myBusinessNotifications: jest.Mock;
    markBusinessNotificationRead: jest.Mock;
    markAllBusinessNotificationsRead: jest.Mock;
  };
  let socketSubject: Subject<NotificationSchema>;

  const notificationA: NotificationSchema = {
    id: 1,
    title: 'A',
    body: 'Body A',
    type: NotificationTypeEnum.INFO,
    creationDate: '2026-08-07T10:00:00.000Z',
    idCreationUser: 1,
    readAt: null,
  };

  const notificationB: NotificationSchema = {
    id: 2,
    title: 'B',
    body: 'Body B',
    type: NotificationTypeEnum.WARNING,
    creationDate: '2026-08-07T11:00:00.000Z',
    idCreationUser: 1,
    readAt: '2026-08-07T12:00:00.000Z',
  };

  beforeEach(async () => {
    socketSubject = new Subject<NotificationSchema>();

    publicService = {
      myNotifications: jest.fn(() =>
        of({ items: [notificationA, notificationB], total: 2 }),
      ),
      markNotificationRead: jest.fn(() =>
        of({ ...notificationA, readAt: '2026-08-07T13:00:00.000Z' }),
      ),
      markAllNotificationsRead: jest.fn(() => of(true)),
    };

    privateService = {
      myBusinessNotifications: jest.fn(() => of({ items: [], total: 0 })),
      markBusinessNotificationRead: jest.fn(() => of(notificationA)),
      markAllBusinessNotificationsRead: jest.fn(() => of(true)),
    };

    await TestBed.configureTestingModule({
      imports: [Notifications, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        {
          provide: UserNotificationsPublicService,
          useValue: publicService,
        },
        {
          provide: BusinessNotificationsPrivateService,
          useValue: privateService,
        },
        {
          provide: NotificationsSocketService,
          useValue: {
            notification$: socketSubject.asObservable(),
            isConnected: () => false,
          },
        },
      ],
    })
      .overrideComponent(Notifications, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(Notifications);
    component = fixture.componentInstance;
    component.businessMode = false;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('refresh', () => {
    it('debe cargar notificaciones del servicio público en modo usuario', () => {
      component.refresh();
      expect(publicService.myNotifications).toHaveBeenCalledWith({
        page: 1,
        limit: 25,
      });
      expect(component.items()).toHaveLength(2);
      expect(component.loading()).toBe(false);
    });

    it('debe marcar loadError en fallo de API', () => {
      publicService.myNotifications.mockReturnValueOnce({
        subscribe: ({ error }: { error: () => void }) => error(),
      });
      component.refresh();
      expect(component.loadError()).toBe(true);
      expect(component.loading()).toBe(false);
    });
  });

  describe('estado de lectura', () => {
    it('debe detectar notificaciones sin leer con hasUnread', () => {
      component.items.set([notificationA, notificationB]);
      expect((component as unknown as { hasUnread(): boolean }).hasUnread()).toBe(true);
    });

    it('debe actualizar un ítem al marcarlo como leído', () => {
      component.items.set([notificationA]);
      jest.spyOn(component.countMayHaveChanged, 'emit');
      (component as unknown as { onMarkRead(id: number): void }).onMarkRead(1);
      expect(publicService.markNotificationRead).toHaveBeenCalledWith(1);
      expect(component.items()[0].readAt).toBeTruthy();
      expect(component.countMayHaveChanged.emit).toHaveBeenCalled();
    });
  });

  describe('tiempo real', () => {
    it('debe insertar notificaciones entrantes por socket', () => {
      jest.spyOn(component.countMayHaveChanged, 'emit');
      const incoming: NotificationSchema = {
        id: 99,
        title: 'Live',
        body: 'Nueva',
        type: NotificationTypeEnum.SYSTEM,
        creationDate: '2026-08-07T14:00:00.000Z',
        idCreationUser: 1,
      };
      (component as unknown as {
        mergeRealtimeNotification(n: NotificationSchema): void;
      }).mergeRealtimeNotification(incoming);
      expect(component.items()[0].id).toBe(99);
      expect(component.countMayHaveChanged.emit).toHaveBeenCalled();
    });

    it('debe actualizar notificación existente por socket', () => {
      component.items.set([notificationA]);
      (component as unknown as {
        mergeRealtimeNotification(n: NotificationSchema): void;
      }).mergeRealtimeNotification({ ...notificationA, title: 'Actualizada' });
      expect(component.items()[0].title).toBe('Actualizada');
    });
  });

  describe('markAllRead', () => {
    it('debe marcar todas como leídas en modo usuario', () => {
      jest.spyOn(component.countMayHaveChanged, 'emit');
      component.items.set([notificationA]);
      (component as unknown as { markAllRead(): void }).markAllRead();
      expect(publicService.markAllNotificationsRead).toHaveBeenCalled();
      expect(component.markAllLoading).toBe(false);
      expect(component.countMayHaveChanged.emit).toHaveBeenCalled();
    });
  });

  describe('modo negocio', () => {
    beforeEach(() => {
      component.businessMode = true;
      fixture.detectChanges();
    });

    it('debe cargar notificaciones del servicio privado', () => {
      privateService.myBusinessNotifications.mockReturnValueOnce(
        of({ items: [notificationA], total: 1 }),
      );
      component.refresh();
      expect(privateService.myBusinessNotifications).toHaveBeenCalled();
    });

    it('debe marcar leída en modo negocio', () => {
      component.items.set([notificationA]);
      (component as unknown as { onMarkRead(id: number): void }).onMarkRead(1);
      expect(privateService.markBusinessNotificationRead).toHaveBeenCalledWith(1);
    });

    it('debe marcar todas como leídas en modo negocio', () => {
      component.items.set([notificationA]);
      (component as unknown as { markAllRead(): void }).markAllRead();
      expect(privateService.markAllBusinessNotificationsRead).toHaveBeenCalled();
    });

    it('debe reportar error de carga en modo negocio', () => {
      privateService.myBusinessNotifications.mockReturnValueOnce({
        subscribe: ({ error }: { error: () => void }) => error(),
      });
      component.refresh();
      expect(component.loadError()).toBe(true);
    });
  });

  it('debe reportar hasUnread false si todas están leídas', () => {
    component.items.set([notificationB]);
    expect((component as unknown as { hasUnread(): boolean }).hasUnread()).toBe(false);
  });
});
