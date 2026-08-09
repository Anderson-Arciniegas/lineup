import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AuthStore,
  BusinessPrivateService,
  BusinessPublicService,
  CurrencyPrivateService,
  DiscountScopeEnum,
  DiscountTypeEnum,
  SocialNetworkPrivateService,
  StatusEnum,
  UtilsService,
  WeekDayEnum,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { BusinessData } from './business-data';

describe('BusinessData', () => {
  let component: BusinessData;
  let fixture: ComponentFixture<BusinessData>;
  let authStore: { isUserLoggedIn: jest.Mock; isBusinessLoggedIn: jest.Mock };
  let socialMediaService: { findByBusiness: jest.Mock };
  let businessPublicService: {
    isFollowingBusiness: jest.Mock;
    followBusiness: jest.Mock;
    unfollowBusiness: jest.Mock;
  };
  let businessPrivateService: { updateBusiness: jest.Mock };
  let messageService: { add: jest.Mock };
  let dialogService: { open: jest.Mock };

  const business = {
    id: 1,
    name: 'Mi negocio',
    followers: 1500,
    hexColor: '#ff0000',
    description: '<p>Descripción</p>',
    discounts: [
      {
        scope: DiscountScopeEnum.BUSINESS,
        status: StatusEnum.ACTIVE,
        discountType: DiscountTypeEnum.PERCENTAGE,
        idCurrency: 1,
      },
    ],
    locations: [{ id: 1, address: 'Calle 1, Ciudad, País' }],
    businessHours: [
      {
        dayOfWeek: WeekDayEnum.MONDAY,
        opensAtMinute: 540,
        closesAtMinute: 1020,
        slotOrder: 1,
      },
      {
        dayOfWeek: WeekDayEnum.TUESDAY,
        opensAtMinute: 540,
        closesAtMinute: 1020,
        slotOrder: 1,
      },
    ],
  } as unknown as import('@lineup/core').BusinessSchema;

  beforeEach(async () => {
    authStore = {
      isUserLoggedIn: jest.fn(() => true),
      isBusinessLoggedIn: jest.fn(() => false),
    };
    socialMediaService = {
      findByBusiness: jest.fn(() =>
        of([
          {
            socialNetwork: { id: 1, code: 'WHATSAPP' },
            url: '',
            phone: '+584121234567',
          },
          {
            socialNetwork: { id: 2, code: 'INSTAGRAM' },
            url: 'https://instagram.com/test',
            phone: '',
          },
        ]),
      ),
    };
    businessPublicService = {
      isFollowingBusiness: jest.fn(() => of(true)),
      followBusiness: jest.fn(() => of({})),
      unfollowBusiness: jest.fn(() => of({})),
    };
    businessPrivateService = {
      updateBusiness: jest.fn(() => of({})),
    };
    messageService = { add: jest.fn() };
    dialogService = { open: jest.fn(() => ({ onClose: of(null) })) };

    await TestBed.configureTestingModule({
      imports: [BusinessData, TranslateModule.forRoot()],
      providers: [
        TranslateService,
        TranslateStore,
        { provide: AuthStore, useValue: authStore },
        { provide: SocialNetworkPrivateService, useValue: socialMediaService },
        { provide: BusinessPublicService, useValue: businessPublicService },
        { provide: BusinessPrivateService, useValue: businessPrivateService },
        { provide: MessageService, useValue: messageService },
        { provide: DialogService, useValue: dialogService },
        {
          provide: CurrencyPrivateService,
          useValue: {
            findAllCurrencies: () =>
              of([{ id: 1, code: 'USD' }, { id: 2, code: 'VES' }]),
          },
        },
        {
          provide: UtilsService,
          useValue: {
            formatWhatsappPhone: (phone: string, msg: string) =>
              `https://wa.me/${phone}?text=${msg}`,
          },
        },
      ],
    })
      .overrideComponent(BusinessData, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(BusinessData);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('business', business);
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe exponer userMode según sesión', () => {
    expect(component.userMode()).toBe(true);
  });

  it('debe cargar monedas en ngOnInit', () => {
    expect(component.currencies).toHaveLength(2);
  });

  it('debe inicializar seguidores, color y descuento en ngOnChanges', () => {
    expect(component.followers).toBe(1500);
    expect(component.color).toBe('#ff0000');
    expect(component.discount).toBeTruthy();
  });

  describe('getDescription', () => {
    it('debe sanitizar la descripción HTML', () => {
      const result = component.getDescription();
      expect(result).toBeTruthy();
    });
  });

  describe('discountCurrencyCode', () => {
    it('debe devolver el código de moneda del descuento', () => {
      expect(component.discountCurrencyCode()).toBe('USD');
    });

    it('debe devolver undefined si no hay moneda', () => {
      component.discount = { ...component.discount, idCurrency: undefined } as typeof component.discount;
      expect(component.discountCurrencyCode()).toBeUndefined();
    });
  });

  describe('getSocialNetworkUrl', () => {
    it('debe devolver URL directa cuando existe', () => {
      component.businessSocialNetworks = [
        {
          socialNetwork: { id: 2, code: 'INSTAGRAM' },
          url: 'https://instagram.com/test',
          phone: '',
        },
      ] as import('@lineup/core').SocialNetworkBusinessSchema[];
      expect(component.getSocialNetworkUrl(2)).toBe('https://instagram.com/test');
    });

    it('debe formatear WhatsApp cuando no hay URL', () => {
      component.businessSocialNetworks = [
        {
          socialNetwork: { id: 1, code: 'WHATSAPP' },
          url: '',
          phone: '+584121234567',
        },
      ] as import('@lineup/core').SocialNetworkBusinessSchema[];
      expect(component.getSocialNetworkUrl(1)).toContain('wa.me');
    });

    it('debe devolver cadena vacía para red sin URL ni WhatsApp', () => {
      component.businessSocialNetworks = [
        {
          socialNetwork: { id: 3, code: 'INSTAGRAM' },
          url: '',
          phone: '',
        },
      ] as import('@lineup/core').SocialNetworkBusinessSchema[];
      expect(component.getSocialNetworkUrl(3)).toBe('');
    });
  });

  describe('formatFollowers', () => {
    it('debe devolver 0 para valores inválidos', () => {
      expect(component.formatFollowers(null as unknown as number)).toBe('0');
      expect(component.formatFollowers(-1)).toBe('0');
    });

    it('debe formatear miles con m', () => {
      expect(component.formatFollowers(1500)).toBe('1.5 m');
      expect(component.formatFollowers(2000)).toBe('2 m');
    });

    it('debe formatear millones con M', () => {
      expect(component.formatFollowers(1_500_000)).toBe('1.5 M');
      expect(component.formatFollowers(2_000_000)).toBe('2 M');
    });

    it('debe devolver el número sin formatear bajo 1000', () => {
      expect(component.formatFollowers(500)).toBe('500');
    });
  });

  describe('getAddress', () => {
    it('debe truncar dirección a las dos primeras partes', () => {
      expect(component.getAddress('Calle 1, Ciudad, País, Extra')).toBe(
        'Calle 1,  Ciudad',
      );
    });
  });

  describe('horarios de negocio', () => {
    it('debe indicar que hay horarios', () => {
      expect(component.hasBusinessHours).toBe(true);
    });

    it('debe mostrar resumen uniforme para semana completa', () => {
      fixture.componentRef.setInput('business', {
        ...business,
        businessHours: [
          { dayOfWeek: WeekDayEnum.MONDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.TUESDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.WEDNESDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.THURSDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.FRIDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.SATURDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.SUNDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
        ],
      } as typeof business);
      fixture.detectChanges();
      expect(component.businessHoursSummaryLabel).toBeTruthy();
      expect(component.shouldShowBusinessHoursChip).toBe(false);
    });

    it('debe mostrar chip variado cuando los horarios difieren', () => {
      fixture.componentRef.setInput('business', {
        ...business,
        businessHours: [
          { dayOfWeek: WeekDayEnum.MONDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.MONDAY, opensAtMinute: 1080, closesAtMinute: 1200, slotOrder: 2 },
        ],
      } as typeof business);
      fixture.detectChanges();
      expect(component.shouldShowBusinessHoursChip).toBe(true);
      expect(component.businessHoursSummaryLabel).toBeNull();
    });

    it('debe mostrar resumen de rango contiguo', () => {
      fixture.componentRef.setInput('business', {
        ...business,
        businessHours: [
          { dayOfWeek: WeekDayEnum.MONDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.TUESDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.WEDNESDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
        ],
      } as typeof business);
      fixture.detectChanges();
      expect(component.businessHoursSummaryLabel).toBeTruthy();
    });

    it('debe tratar días no contiguos como variado', () => {
      fixture.componentRef.setInput('business', {
        ...business,
        businessHours: [
          { dayOfWeek: WeekDayEnum.MONDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.WEDNESDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
        ],
      } as typeof business);
      fixture.detectChanges();
      expect(component.shouldShowBusinessHoursChip).toBe(true);
    });

    it('debe mostrar resumen para un solo día uniforme', () => {
      fixture.componentRef.setInput('business', {
        ...business,
        businessHours: [
          { dayOfWeek: WeekDayEnum.FRIDAY, opensAtMinute: 570, closesAtMinute: 1050, slotOrder: 1 },
        ],
      } as typeof business);
      fixture.detectChanges();
      expect(component.businessHoursSummaryLabel).toBeTruthy();
      expect(component.shouldShowBusinessHoursChip).toBe(false);
    });

    it('debe marcar variado si un día tiene múltiples franjas', () => {
      fixture.componentRef.setInput('business', {
        ...business,
        businessHours: [
          { dayOfWeek: WeekDayEnum.MONDAY, opensAtMinute: 540, closesAtMinute: 720, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.MONDAY, opensAtMinute: 780, closesAtMinute: 1020, slotOrder: 2 },
          { dayOfWeek: WeekDayEnum.TUESDAY, opensAtMinute: 540, closesAtMinute: 720, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.TUESDAY, opensAtMinute: 780, closesAtMinute: 1020, slotOrder: 2 },
        ],
      } as typeof business);
      fixture.detectChanges();
      expect(component.shouldShowBusinessHoursChip).toBe(true);
    });

    it('no debe abrir modal si no hay horarios', () => {
      fixture.componentRef.setInput('business', { ...business, businessHours: [] } as typeof business);
      fixture.detectChanges();
      component.openBusinessHoursModal();
      expect(dialogService.open).not.toHaveBeenCalled();
    });

    it('debe abrir modal de horarios', () => {
      component.openBusinessHoursModal();
      expect(dialogService.open).toHaveBeenCalled();
    });

    it('debe marcar variado si los horarios difieren entre días con una franja', () => {
      fixture.componentRef.setInput('business', {
        ...business,
        businessHours: [
          { dayOfWeek: WeekDayEnum.MONDAY, opensAtMinute: 540, closesAtMinute: 1020, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.TUESDAY, opensAtMinute: 600, closesAtMinute: 1080, slotOrder: 1 },
        ],
      } as typeof business);
      fixture.detectChanges();
      expect(component.shouldShowBusinessHoursChip).toBe(true);
      expect(component.businessHoursSummaryLabel).toBeNull();
    });

    it('debe ordenar franjas cuando slotOrder no está definido', () => {
      fixture.componentRef.setInput('business', {
        ...business,
        businessHours: [
          { dayOfWeek: WeekDayEnum.MONDAY, opensAtMinute: 540, closesAtMinute: 1020 },
          { dayOfWeek: WeekDayEnum.TUESDAY, opensAtMinute: 540, closesAtMinute: 1020 },
          { dayOfWeek: WeekDayEnum.WEDNESDAY, opensAtMinute: 540, closesAtMinute: 1020 },
        ],
      } as typeof business);
      fixture.detectChanges();
      expect(component.businessHoursSummaryLabel).toBeTruthy();
    });

    it('debe formatear horarios con minutos en el resumen', () => {
      fixture.componentRef.setInput('business', {
        ...business,
        businessHours: [
          { dayOfWeek: WeekDayEnum.MONDAY, opensAtMinute: 545, closesAtMinute: 1025, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.TUESDAY, opensAtMinute: 545, closesAtMinute: 1025, slotOrder: 1 },
          { dayOfWeek: WeekDayEnum.WEDNESDAY, opensAtMinute: 545, closesAtMinute: 1025, slotOrder: 1 },
        ],
      } as typeof business);
      fixture.detectChanges();
      expect(component.businessHoursSummaryLabel).toBeTruthy();
    });
  });

  describe('modales y acciones', () => {
    it('debe abrir modal de ubicaciones', () => {
      component.openLocationsModal();
      expect(dialogService.open).toHaveBeenCalled();
    });

    it('debe abrir modal de ubicación individual', () => {
      component.openLocationModal(business.locations[0] as import('@lineup/core').LocationSchema);
      expect(dialogService.open).toHaveBeenCalled();
    });

    it('debe abrir modal de compartir', () => {
      component.share();
      expect(dialogService.open).toHaveBeenCalled();
    });
  });

  describe('seguir / dejar de seguir', () => {
    it('debe incrementar seguidores al seguir', () => {
      component.followers = 10;
      component.followBusiness();
      expect(businessPublicService.followBusiness).toHaveBeenCalledWith(1);
      expect(component.followers).toBe(11);
    });

    it('debe revertir following en error al seguir', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      businessPublicService.followBusiness.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      component.followBusiness();
      expect(component.following).toBe(false);
    });

    it('debe decrementar seguidores al dejar de seguir', () => {
      component.followers = 10;
      component.following = true;
      component.unfollowBusiness();
      expect(component.followers).toBe(9);
    });

    it('debe revertir following en error al dejar de seguir', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      businessPublicService.unfollowBusiness.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      component.unfollowBusiness();
      expect(component.following).toBe(true);
    });
  });

  describe('color del negocio', () => {
    it('debe guardar color y mostrar toast de éxito', () => {
      component.color = '#00ff00';
      component.saveColor();
      expect(businessPrivateService.updateBusiness).toHaveBeenCalledWith({
        id: 1,
        hexColor: '#00ff00',
      });
      expect(messageService.add).toHaveBeenCalled();
      expect(component.attemptColor).toBe(false);
    });

    it('debe manejar error al guardar color', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      businessPrivateService.updateBusiness.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      component.saveColor();
      expect(component.attemptColor).toBe(false);
    });

    it('debe resetear color y emitir colorChange', () => {
      jest.spyOn(component.colorChange, 'emit');
      component.color = '#000000';
      component.resetColor();
      expect(component.color).toBe('#ff0000');
      expect(component.colorChange.emit).toHaveBeenCalledWith('#ff0000');
    });

    it('debe emitir colorChange con setColor', () => {
      jest.spyOn(component.colorChange, 'emit');
      component.color = '#123456';
      component.setColor();
      expect(component.colorChange.emit).toHaveBeenCalledWith('#123456');
    });
  });

  it('debe manejar error al cargar redes sociales', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    socialMediaService.findByBusiness.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.getMySocialNetworkBusinesses();
    expect(component.attempt).toBe(false);
  });

  it('debe limpiar redes cuando la API devuelve vacío', () => {
    socialMediaService.findByBusiness.mockReturnValue(of([]));
    component.getMySocialNetworkBusinesses();
    expect(component.businessSocialNetworks).toEqual([]);
    expect(component.attempt).toBe(false);
  });

  it('debe manejar error al consultar si sigue al negocio', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    businessPublicService.isFollowingBusiness.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.isFollowingBusiness();
  });

  it('debe limpiar suscripciones en ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
