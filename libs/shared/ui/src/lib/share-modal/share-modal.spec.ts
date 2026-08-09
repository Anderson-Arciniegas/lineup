import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ShareModal } from './share-modal';

describe('ShareModal', () => {
  let component: ShareModal;
  let fixture: ComponentFixture<ShareModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogConfig, useValue: { data: {} } },
      ],
    })
      .overrideComponent(ShareModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ShareModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('url', 'https://lineup.com/producto/1');
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe usar la URL del input en displayUrl', () => {
    expect(component.displayUrl()).toBe('https://lineup.com/producto/1');
  });

  it('debe preferir la URL de DynamicDialogConfig sobre el input', () => {
    const config = TestBed.inject(DynamicDialogConfig);
    config.data = { url: 'https://lineup.com/desde-dialog' };
    expect(component.displayUrl()).toBe('https://lineup.com/desde-dialog');
  });

  describe('copyUrl', () => {
    it('debe copiar la URL y marcar copied temporalmente', async () => {
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText },
      });

      component.copyUrl();
      await Promise.resolve();

      expect(writeText).toHaveBeenCalledWith('https://lineup.com/producto/1');
      expect(component.copied()).toBe(true);
    });
  });

  describe('shareOn', () => {
    it('debe abrir la URL de compartir de la red elegida', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      const whatsapp = component.shareOptions.find((o) => o.id === 'whatsapp');
      expect(whatsapp).toBeDefined();
      component.shareOn(whatsapp!);
      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/?text='),
        '_blank',
        'noopener,noreferrer',
      );
      openSpy.mockRestore();
    });

    it('debe compartir en todas las redes configuradas', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      for (const network of component.shareOptions) {
        component.shareOn(network);
        expect(openSpy).toHaveBeenCalled();
      }
      openSpy.mockRestore();
    });
  });

  it('debe detectar uso dentro de DynamicDialog', () => {
    expect(component.isInsideDynamicDialog()).toBe(true);
  });

  it('no debe copiar si clipboard no está disponible', () => {
    const original = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    component.copyUrl();
    expect(component.copied()).toBe(false);
    Object.defineProperty(navigator, 'clipboard', { value: original, configurable: true });
  });
});

describe('ShareModal standalone', () => {
  it('debe usar URL del input sin DynamicDialog', async () => {
    await TestBed.configureTestingModule({
      imports: [ShareModal, TranslateModule.forRoot()],
      providers: [provideRouter([]), TranslateService, TranslateStore],
    })
      .overrideComponent(ShareModal, { set: { template: '' } })
      .compileComponents();

    const fixture = TestBed.createComponent(ShareModal);
    const cmp = fixture.componentInstance;
    fixture.componentRef.setInput('url', 'https://lineup.com/standalone');
    fixture.detectChanges();
    expect(cmp.isInsideDynamicDialog()).toBe(false);
    expect(cmp.displayUrl()).toBe('https://lineup.com/standalone');
  });
});
