import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  BusinessApiFilePrivateService,
  BusinessPrivateService,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { EditBusinessPage } from './edit-business-page';

describe('EditBusinessPage', () => {
  let component: EditBusinessPage;
  let fixture: ComponentFixture<EditBusinessPage>;
  let updateBusiness: jest.Mock;
  let setBusiness: jest.Mock;
  let messageAdd: jest.Mock;

  const loadedBusiness = {
    id: 42,
    name: 'Test Business',
    email: 'test@business.com',
    path: 'test-business',
    telephone: '+58 (499) 999-9999',
    description: 'Desc',
    isOnline: false,
    image: { name: 'img-code', url: 'https://example.com/i.png' },
    tags: ['foo'],
  };

  beforeEach(async () => {
    updateBusiness = jest.fn(() => of({ ...loadedBusiness, name: 'Updated' }));
    setBusiness = jest.fn();
    messageAdd = jest.fn();

    await TestBed.configureTestingModule({
      imports: [EditBusinessPage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        provideNoopAnimations(),
        { provide: Apollo, useValue: createApolloMock().mock },
        { provide: MessageService, useValue: { add: messageAdd } },
        DialogService,
        {
          provide: BusinessPrivateService,
          useValue: {
            myBusiness: () => of(loadedBusiness as any),
            updateBusiness,
          },
        },
        {
          provide: UtilsService,
          useValue: {
            normalizeSpaces: (s: string) => String(s ?? '').trim(),
            blobToFile: (blob: Blob, fileName: string) =>
              new File([blob], fileName, {
                type: (blob as Blob & { type?: string })?.type ?? 'image/png',
              }),
            getExtensionFile: () => 'png',
            compressImage: (base64: string) => of(base64),
          },
        },
        {
          provide: BusinessApiFilePrivateService,
          useValue: {
            post: () => of({ type: 0 } as any),
          },
        },
        {
          provide: AuthStore,
          useValue: { setBusiness },
        },
      ],
    })
      .overrideComponent(EditBusinessPage, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditBusinessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Tras `myBusiness`, el formulario refleja los datos del negocio cargado.
   */
  describe('carga de negocio', () => {
    it('debe rellenar el formulario y tags', () => {
      expect(component.business?.id).toBe(42);
      expect(component.businessForm.value.name).toBe('Test Business');
      expect(component.businessForm.value.businessPath).toBe('test-business');
      expect(component.imgCode).toBe('img-code');
      expect(component.tags).toContain('foo');
    });
  });

  /**
   * Validación del path público del negocio (patrón alfanumérico + ._-).
   */
  describe('validación businessPath', () => {
    it('debe rechazar caracteres no permitidos', () => {
      component.businessForm.patchValue({ businessPath: 'path con espacios' });
      expect(component.businessPathControl?.valid).toBe(false);
    });

    it('debe aceptar un path válido', () => {
      component.businessForm.patchValue({ businessPath: 'mi-negocio_1' });
      expect(component.businessPathControl?.valid).toBe(true);
    });
  });

  /**
   * `updateBusiness` exige formulario válido, imagen y delega en el servicio.
   */
  describe('updateBusiness', () => {
    it('no debe enviar sin código de imagen', () => {
      component.imgCode = '';
      component.updateBusiness();
      expect(updateBusiness).not.toHaveBeenCalled();
    });

    it('debe llamar al servicio y actualizar AuthStore al tener éxito', () => {
      component.imgCode = 'img-code';
      component.businessForm.patchValue({
        name: 'Nombre',
        businessPath: 'valid-path',
        phone: '123',
        description: 'x',
        isOnline: true,
      });
      component.updateBusiness();
      expect(updateBusiness).toHaveBeenCalled();
      expect(setBusiness).toHaveBeenCalled();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });
  });
});
