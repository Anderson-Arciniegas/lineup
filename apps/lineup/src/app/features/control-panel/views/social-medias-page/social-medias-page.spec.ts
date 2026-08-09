import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SocialNetworkPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, of, throwError } from 'rxjs';
import { SocialMediasPage } from './social-medias-page';

describe('SocialMediasPage', () => {
  let component: SocialMediasPage;
  let fixture: ComponentFixture<SocialMediasPage>;
  let dialogOpen: jest.Mock;
  let onClose$: Subject<unknown>;
  let messageAdd: jest.Mock;
  let findAllMySocialNetworkBusinesses: jest.Mock;
  let getSocialNetworks: jest.Mock;
  let removeSocialNetworkBusiness: jest.Mock;

  const socialNetwork = { id: 1, name: 'Instagram' };
  const longUrl =
    'https://example.com/very-long-social-media-url-that-exceeds-thirty-chars';
  const businessLink = {
    id: 50,
    url: longUrl,
    phone: null,
    socialNetwork: { id: 1 },
  };

  beforeEach(async () => {
    onClose$ = new Subject<unknown>();
    dialogOpen = jest.fn(() => ({ onClose: onClose$.asObservable() }));
    messageAdd = jest.fn();
    findAllMySocialNetworkBusinesses = jest.fn(() => of([businessLink]));
    getSocialNetworks = jest.fn(() => of([socialNetwork]));
    removeSocialNetworkBusiness = jest.fn(() => of(undefined));

    await TestBed.configureTestingModule({
      imports: [SocialMediasPage, TranslateModule.forRoot()],
      providers: [
        { provide: DialogService, useValue: { open: dialogOpen } },
        { provide: MessageService, useValue: { add: messageAdd } },
        { provide: UtilsService, useValue: {} },
        {
          provide: SocialNetworkPrivateService,
          useValue: {
            findAllMySocialNetworkBusinesses,
            getSocialNetworks,
            removeSocialNetworkBusiness,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialMediasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear y cargar redes', () => {
    expect(component).toBeTruthy();
    expect(findAllMySocialNetworkBusinesses).toHaveBeenCalled();
    expect(getSocialNetworks).toHaveBeenCalled();
    expect(component.socialMedias.length).toBe(1);
    expect(component.businessSocialNetworks.length).toBe(1);
  });

  describe('getSocialNetworkUrl', () => {
    it('debe truncar URLs largas', () => {
      const url = component.getSocialNetworkUrl(1);
      expect(url.endsWith('...')).toBe(true);
    });

    it('debe devolver teléfono si no hay url', () => {
      component.businessSocialNetworks = [
        {
          id: 2,
          url: '',
          phone: '+1234567890',
          socialNetwork: { id: 2 },
        } as any,
      ];
      expect(component.getSocialNetworkUrl(2)).toBe('+1234567890');
    });

    it('debe devolver vacío si no existe la red', () => {
      expect(component.getSocialNetworkUrl(999)).toBe('');
    });
  });

  describe('addSocialMediaModal', () => {
    it('debe refrescar y mostrar toast al crear', () => {
      component.addSocialMediaModal(socialNetwork as any);
      onClose$.next({ id: 99 });
      expect(findAllMySocialNetworkBusinesses).toHaveBeenCalledTimes(2);
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });

    it('debe mostrar toast de actualización si ya existía', () => {
      component.addSocialMediaModal(socialNetwork as any);
      onClose$.next(businessLink);
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });
  });

  describe('deleteSocialNetwork', () => {
    it('debe eliminar tras confirmación', () => {
      component.deleteSocialNetwork(socialNetwork as any);
      onClose$.next(true);
      expect(removeSocialNetworkBusiness).toHaveBeenCalledWith(50);
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });

    it('no debe eliminar si el usuario cancela', () => {
      component.deleteSocialNetwork(socialNetwork as any);
      onClose$.next(false);
      expect(removeSocialNetworkBusiness).not.toHaveBeenCalled();
    });
  });
});

describe('SocialMediasPage errores', () => {
  it('debe manejar error al cargar redes del negocio', async () => {
    await TestBed.configureTestingModule({
      imports: [SocialMediasPage, TranslateModule.forRoot()],
      providers: [
        { provide: DialogService, useValue: { open: jest.fn() } },
        { provide: MessageService, useValue: { add: jest.fn() } },
        { provide: UtilsService, useValue: {} },
        {
          provide: SocialNetworkPrivateService,
          useValue: {
            findAllMySocialNetworkBusinesses: () =>
              throwError(() => new Error('fail')),
            getSocialNetworks: () => of([]),
          },
        },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(SocialMediasPage);
    fix.detectChanges();
    expect(fix.componentInstance.attempt).toBe(false);
  });
});
