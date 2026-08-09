import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  NotificationTypeEnum,
  type NotificationSchema,
} from '@lineup/core';
import { NotificationItem } from './notification-item';

describe('NotificationItem', () => {
  let component: NotificationItem;
  let fixture: ComponentFixture<NotificationItem>;

  const baseNotification: NotificationSchema = {
    id: 7,
    title: 'Nuevo pedido',
    body: 'Tienes un pedido pendiente',
    type: NotificationTypeEnum.SUCCESS,
    creationDate: '2026-08-07T12:00:00.000Z',
    idCreationUser: 1,
    readAt: null,
    payload: {
      entity: 'products',
      catalogPath: 'catalogo-a',
      id: 99,
      link: '/dashboard/catalogs/catalogo-a/99',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationItem],
      providers: [provideRouter([])],
    })
      .overrideComponent(NotificationItem, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(NotificationItem);
    component = fixture.componentInstance;
    component.notification = baseNotification;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('typeVisual', () => {
    it('debe devolver icono y clase para tipo SUCCESS', () => {
      const visual = (component as unknown as { typeVisual(): { icon: string; badgeClass: string } }).typeVisual();
      expect(visual.icon).toBe('pi pi-check-circle');
      expect(visual.badgeClass).toBe('notification-item__badge--success');
    });

    it('debe usar INFO como fallback para tipos desconocidos', () => {
      component.notification = {
        ...baseNotification,
        type: 'UNKNOWN' as NotificationTypeEnum,
      };
      const visual = (component as unknown as { typeVisual(): { icon: string } }).typeVisual();
      expect(visual.icon).toBe('pi pi-info-circle');
    });

    it('debe devolver visual para WARNING', () => {
      component.notification = {
        ...baseNotification,
        type: NotificationTypeEnum.WARNING,
      };
      const visual = (component as unknown as { typeVisual(): { badgeClass: string } }).typeVisual();
      expect(visual.badgeClass).toBe('notification-item__badge--warning');
    });

    it('debe devolver visual para ERROR y SYSTEM', () => {
      component.notification = {
        ...baseNotification,
        type: NotificationTypeEnum.ERROR,
      };
      expect(
        (component as unknown as { typeVisual(): { icon: string } }).typeVisual().icon,
      ).toBe('pi pi-times-circle');

      component.notification = {
        ...baseNotification,
        type: NotificationTypeEnum.SYSTEM,
      };
      expect(
        (component as unknown as { typeVisual(): { icon: string } }).typeVisual().icon,
      ).toBe('pi pi-cog');
    });
  });

  describe('enlaces del payload', () => {
    it('debe construir router commands para productos del panel', () => {
      const commands = (component as unknown as {
        productPanelRouterCommands(): (string | number)[] | null;
      }).productPanelRouterCommands();
      expect(commands).toEqual([
        '/',
        expect.any(String),
        expect.any(String),
        'catalogo-a',
        99,
      ]);
    });

    it('debe detectar enlaces externos http/https', () => {
      component.notification = {
        ...baseNotification,
        payload: { link: 'https://example.com/promo' },
      };
      const href = (component as unknown as { externalPayloadHref(): string | null }).externalPayloadHref();
      expect(href).toBe('https://example.com/promo');
    });

    it('debe normalizar enlaces internos sin barra inicial', () => {
      component.notification = {
        ...baseNotification,
        payload: { link: 'dashboard/home' },
      };
      const link = (component as unknown as { internalPayloadRouterLink(): string | null }).internalPayloadRouterLink();
      expect(link).toBe('/dashboard/home');
    });

    it('debe devolver null sin payload de producto válido', () => {
      component.notification = { ...baseNotification, payload: { entity: 'orders' } };
      expect(
        (component as unknown as { productPanelRouterCommands(): unknown }).productPanelRouterCommands(),
      ).toBeNull();
    });

    it('debe devolver null para enlaces externos inválidos', () => {
      component.notification = {
        ...baseNotification,
        payload: { link: 'ftp://invalid' },
      };
      expect(
        (component as unknown as { externalPayloadHref(): unknown }).externalPayloadHref(),
      ).toBeNull();
      expect(
        (component as unknown as { internalPayloadRouterLink(): unknown }).internalPayloadRouterLink(),
      ).toBe('/ftp://invalid');
    });
  });

  describe('onActivate', () => {
    it('debe emitir markRead si la notificación no está leída', () => {
      jest.spyOn(component.markRead, 'emit');
      (component as unknown as { onActivate(): void }).onActivate();
      expect(component.markRead.emit).toHaveBeenCalledWith(7);
    });

    it('no debe emitir markRead si ya tiene readAt', () => {
      component.notification = {
        ...baseNotification,
        readAt: '2026-08-07T13:00:00.000Z',
      };
      jest.spyOn(component.markRead, 'emit');
      (component as unknown as { onActivate(): void }).onActivate();
      expect(component.markRead.emit).not.toHaveBeenCalled();
    });
  });
});
