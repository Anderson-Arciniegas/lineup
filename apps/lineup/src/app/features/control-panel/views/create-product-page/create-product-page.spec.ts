import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import {
  BusinessApiFilePrivateService,
  BusinessPrivateService,
  CatalogPrivateService,
  ProductPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { CreateProductPage } from './create-product-page';

describe('CreateProductPage', () => {
  let fixture: ComponentFixture<CreateProductPage>;
  let component: CreateProductPage;
  let getBusinessByPath: jest.Mock;
  let findOneCatalogByPath: jest.Mock;
  let createProduct: jest.Mock;
  let messageAdd: jest.Mock;

  beforeEach(async () => {
    getBusinessByPath = jest.fn(() =>
      of({ id: 1, path: 'test-business', name: 'B' }),
    );
    findOneCatalogByPath = jest.fn(() =>
      of({ id: 99, path: 'my-cat', title: 'Cat' }),
    );
    createProduct = jest.fn(() => of({ id: 500 }));
    messageAdd = jest.fn();
    const { mock: apolloMock } = createApolloMock();

    await TestBed.configureTestingModule({
      imports: [CreateProductPage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                business: 'test-business',
                catalogPath: 'my-cat',
              },
              paramMap: convertToParamMap({
                business: 'test-business',
                catalogPath: 'my-cat',
              }),
            },
          },
        },
        TranslateService,
        TranslateStore,
        { provide: DialogService, useValue: { open: jest.fn(() => ({ onClose: of(undefined) })) } },
        { provide: MessageService, useValue: { add: messageAdd } },
        { provide: Apollo, useValue: apolloMock },
        {
          provide: BusinessPrivateService,
          useValue: { getBusinessByPath },
        },
        {
          provide: CatalogPrivateService,
          useValue: { findOneCatalogByPath },
        },
        {
          provide: ProductPrivateService,
          useValue: { createProduct, findOneProduct: jest.fn(), updateProduct: jest.fn() },
        },
        {
          provide: UtilsService,
          useValue: {
            normalizeSpaces: (s: string) => String(s ?? '').trim(),
            navigate: jest.fn(),
            blobToFile: jest.fn(),
            getExtensionFile: jest.fn(() => 'png'),
          },
        },
        {
          provide: BusinessApiFilePrivateService,
          useValue: { post: jest.fn(() => of({})) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Al iniciar con `business` y `catalogPath` en la ruta, carga negocio y catálogo.
   */
  describe('carga inicial', () => {
    it('debe solicitar negocio y catálogo por path', () => {
      expect(getBusinessByPath).toHaveBeenCalledWith('test-business');
      expect(findOneCatalogByPath).toHaveBeenCalledWith('my-cat');
      expect(component.business?.path).toBe('test-business');
      expect(component.catalog?.id).toBe(99);
    });
  });

  /**
   * `createProduct()` valida formulario, imágenes y catálogo antes de mutar.
   */
  describe('createProduct', () => {
    beforeEach(() => {
      component.createProductForm.patchValue({
        title: 'Producto test',
        subtitle: 'Sub',
        description: 'Descripción mínima',
      });
      component.imgCodes = ['img-code-1'];
      component.catalog = { id: 99, path: 'my-cat' } as any;
      component.product = undefined as any;
    });

    it('no debe enviar si el formulario es inválido', () => {
      component.createProductForm.patchValue({ title: '', description: '' });
      component.createProduct();
      expect(createProduct).not.toHaveBeenCalled();
    });

    it('debe avisar si no hay imágenes', () => {
      component.imgCodes = [];
      component.createProduct();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn' }),
      );
      expect(createProduct).not.toHaveBeenCalled();
    });

    it('debe avisar si falta catálogo', () => {
      component.catalog = null;
      component.createProduct();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn' }),
      );
      expect(createProduct).not.toHaveBeenCalled();
    });

    it('debe llamar a ProductPrivateService.createProduct con datos coherentes', () => {
      component.createProduct();
      expect(createProduct).toHaveBeenCalled();
      const payload = createProduct.mock.calls[0][0];
      expect(payload).toEqual(
        expect.objectContaining({
          title: 'Producto test',
          idCatalog: 99,
          images: [{ imageCode: 'img-code-1', order: 0 }],
        }),
      );
    });
  });
});
