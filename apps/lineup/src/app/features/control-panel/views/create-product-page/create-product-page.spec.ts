import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import {
  BusinessApiFilePrivateService,
  BusinessPrivateService,
  CatalogPrivateService,
  ProductPrivateService,
  StorageService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { HttpEventType } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { CreateProductPage } from './create-product-page';

describe('CreateProductPage', () => {
  let fixture: ComponentFixture<CreateProductPage>;
  let component: CreateProductPage;
  let getBusinessByPath: jest.Mock;
  let findOneCatalogByPath: jest.Mock;
  let createProduct: jest.Mock;
  let messageAdd: jest.Mock;
  let navigate: jest.Mock;
  let dialogOpen: jest.Mock;

  beforeEach(async () => {
    getBusinessByPath = jest.fn(() =>
      of({ id: 1, path: 'test-business', name: 'B' }),
    );
    findOneCatalogByPath = jest.fn(() =>
      of({ id: 99, path: 'my-cat', title: 'Cat' }),
    );
    createProduct = jest.fn(() => of({ id: 500 }));
    messageAdd = jest.fn();
    navigate = jest.fn();
    dialogOpen = jest.fn(() => ({ onClose: of(undefined) }));
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
        { provide: DialogService, useValue: { open: dialogOpen } },
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
            navigate,
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

    it('create exitoso navega al inventario del producto', () => {
      component.createProduct();
      expect(navigate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(String),
          expect.any(String),
          'my-cat',
          500,
          expect.any(String),
        ]),
      );
    });

    it('createProduct error muestra toast de error', () => {
      createProduct.mockReturnValue(throwError(() => ({ message: 'create fail' })));
      component.createProduct();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', detail: 'create fail' }),
      );
    });
  });

  describe('variaciones', () => {
    it('addColorVariation debe añadir grupo de color', () => {
      component.addColorVariation();
      expect(component.variationsFormArray.length).toBe(1);
      expect(
        component.isColorVariation(component.variationsFormArray.at(0)),
      ).toBe(true);
    });

    it('addSizeVariation debe añadir grupo de talla', () => {
      component.addSizeVariation();
      expect(component.isSizeVariation(component.variationsFormArray.at(0))).toBe(
        true,
      );
    });

    it('getPredefinedOptions devuelve colores para variación color', () => {
      component.addColorVariation();
      const group = component.variationsFormArray.at(0);
      const options = component.getPredefinedOptions(group);
      expect(options.length).toBeGreaterThan(0);
    });

    it('onPredefinedOptionsChange actualiza opciones', () => {
      component.addColorVariation();
      const group = component.variationsFormArray.at(0);
      component.onPredefinedOptionsChange(group, ['red', 'blue']);
      expect(component.getVariationOptionsFormArray(group).length).toBe(2);
    });

    it('addVariationOption ignora valor vacío', () => {
      component.addVariation();
      const group = component.variationsFormArray.at(0);
      component.addVariationOption(group);
      expect(component.getVariationOptionsFormArray(group).length).toBe(0);
    });

    it('removeVariation elimina grupo', () => {
      component.addVariation();
      component.removeVariation(0);
      expect(component.variationsFormArray.length).toBe(0);
    });
  });

  describe('imágenes', () => {
    it('onImagesChange sincroniza urls e imgCodes', () => {
      component.onImagesChange({
        urls: ['https://x.com/a.png'],
        imageCodes: ['code-a'],
      });
      expect(component.urls).toEqual(['https://x.com/a.png']);
      expect(component.imgCodes).toEqual(['code-a']);
    });

    it('removeImage elimina url por índice', () => {
      component.urls = ['a', 'b'];
      component.imgCodes = ['c1', 'c2'];
      component.removeImage(0);
      expect(component.urls).toEqual(['b']);
      expect(component.imgCodes).toEqual(['c1', 'c2']);
    });

    it('onDragOver y onDragLeave alternan isDragging', () => {
      const event = { preventDefault: jest.fn() } as unknown as DragEvent;
      component.onDragOver(event);
      expect(component.isDragging).toBe(true);
      component.onDragLeave(event);
      expect(component.isDragging).toBe(false);
    });

    it('onDrop procesa archivo de imagen', () => {
      const file = new File(['x'], 'pic.png', { type: 'image/png' });
      const event = {
        preventDefault: jest.fn(),
        dataTransfer: { files: [file] },
      } as unknown as DragEvent;
      component.onDrop(event);
      expect(component.isDragging).toBe(false);
    });

    it('handleFile rechaza archivos que no son imagen', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
      component.handleFile(file);
      expect(alertSpy).toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('onFileSelected ignora input sin archivos', () => {
      const input = document.createElement('input');
      component.onFileSelected({ target: input } as unknown as Event);
      expect(component.urls.length).toBe(0);
    });
  });

  describe('upload y cropper', () => {
    let postMock: jest.Mock;

    beforeEach(() => {
      postMock = jest.fn(() =>
        of({
          type: HttpEventType.Response,
          status: 200,
          body: { file: { name: 'uploaded.png', url: 'https://cdn/x.png' } },
        }),
      );
      component['_utils'] = {
        ...component['_utils'],
        blobToFile: () => new Blob(['x'], { type: 'image/png' }),
        getExtensionFile: () => 'png',
      } as typeof component['_utils'];
      component['_apiFileService'] = { post: postMock } as typeof component['_apiFileService'];
    });

    it('uploadFile debe registrar éxito y códigos de imagen', () => {
      component.uploadFile('data:image/png;base64,abc');
      expect(postMock).toHaveBeenCalled();
      expect(component.imgCodes).toContain('uploaded.png');
    });

    it('uploadFile debe registrar error adultContent', () => {
      postMock.mockReturnValue(
        throwError(() => ({ error: { code: 22011 } })),
      );
      component.uploadFile('data:image/png;base64,abc');
      expect(component.uploadFailed).toBe(true);
      expect(component.adultContent).toBe(true);
    });

    it('openImageCropper debe subir imagen al cerrar con base64', () => {
      const dialogOpen = jest.fn(() => ({
        onClose: of('data:image/png;base64,abc'),
      }));
      component['_dialogService'] = { open: dialogOpen } as typeof component['_dialogService'];
      component.openImageCropper();
      expect(dialogOpen).toHaveBeenCalled();
      expect(postMock).toHaveBeenCalled();
    });
  });

  describe('modo edición', () => {
    let updateProduct: jest.Mock;
    let findOneProduct: jest.Mock;
    let navigate: jest.Mock;

    beforeEach(async () => {
      updateProduct = jest.fn(() => of({ id: 500 }));
      findOneProduct = jest.fn(() =>
        of({
          id: 500,
          title: 'Existente',
          subtitle: 'Sub',
          description: 'Desc',
          isPrimary: false,
          catalog: { id: 99, path: 'my-cat' },
          variations: [
            {
              id: 1,
              title: 'variations.color',
              options: ['red'],
            },
            {
              id: 2,
              title: 'variations.size',
              options: ['m'],
            },
            {
              id: 3,
              title: 'custom',
              options: ['x'],
            },
          ],
          productFiles: [{ file: { url: 'https://img/a.png', name: 'code-a' } }],
        }),
      );
      navigate = jest.fn();
      TestBed.resetTestingModule();
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
                  idProduct: '500',
                },
                paramMap: convertToParamMap({
                  business: 'test-business',
                  catalogPath: 'my-cat',
                  idProduct: '500',
                }),
                data: {},
              },
              parent: null,
            },
          },
          TranslateService,
          TranslateStore,
          {
            provide: DialogService,
            useValue: {
              open: jest.fn(() => ({
                onClose: of(101),
              })),
            },
          },
          { provide: MessageService, useValue: { add: messageAdd } },
          { provide: Apollo, useValue: apolloMock },
          {
            provide: BusinessPrivateService,
            useValue: { getBusinessByPath: jest.fn(() => of({ id: 1, path: 'test-business' })) },
          },
          {
            provide: CatalogPrivateService,
            useValue: {
              findOneCatalogByPath: jest.fn(() => of({ id: 99, path: 'my-cat' })),
              findOneCatalog: jest.fn(() => of({ id: 101, path: 'other-cat' })),
            },
          },
          {
            provide: ProductPrivateService,
            useValue: {
              createProduct,
              findOneProduct,
              updateProduct,
            },
          },
          {
            provide: UtilsService,
            useValue: {
              normalizeSpaces: (s: string) => String(s ?? '').trim(),
              navigate,
              blobToFile: jest.fn(),
              getExtensionFile: jest.fn(() => 'png'),
            },
          },
          {
            provide: BusinessApiFilePrivateService,
            useValue: { post: jest.fn(() => of({})) },
          },
          {
            provide: StorageService,
            useValue: { remove: jest.fn() },
          },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(CreateProductPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('debe cargar producto existente con variaciones', () => {
      expect(findOneProduct).toHaveBeenCalledWith(500);
      expect(component.product?.id).toBe(500);
      expect(component.variationsFormArray.length).toBe(3);
    });

    it('createProduct en edición debe llamar updateProduct', () => {
      component.createProductForm.patchValue({
        title: 'Actualizado',
        description: 'Nueva desc',
      });
      component.imgCodes = ['code-a'];
      component.createProduct();
      expect(updateProduct).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalled();
    });

    it('switchCatalog debe actualizar catálogo seleccionado', () => {
      component.product = { id: 500, catalog: { id: 99 } } as any;
      component.switchCatalog();
      expect(component.catalog?.id).toBe(101);
    });

    it('switchCatalog no hace nada sin producto', () => {
      component.product = undefined as any;
      component.switchCatalog();
      expect(component.catalog?.id).toBe(99);
    });

    it('switchCatalog no recarga si el catálogo es el mismo', () => {
      const findOneCatalog = jest.fn(() => of({ id: 101, path: 'other-cat' }));
      (TestBed.inject(CatalogPrivateService) as any).findOneCatalog = findOneCatalog;
      component['_dialogService'] = {
        open: jest.fn(() => ({ onClose: of(99) })),
      } as typeof component['_dialogService'];
      component.switchCatalog();
      expect(findOneCatalog).not.toHaveBeenCalled();
    });

    it('update sin business navega por dashboard', () => {
      component.business = undefined as any;
      component.createProductForm.patchValue({
        title: 'Actualizado',
        description: 'Nueva desc',
      });
      component.imgCodes = ['code-a'];
      component.createProduct();
      expect(navigate).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(String), expect.any(String), 'my-cat']),
      );
    });

    it('no debe enviar si isSubmitting', () => {
      component.isSubmitting = true;
      component.createProductForm.patchValue({
        title: 'X',
        description: 'Y',
      });
      component.imgCodes = ['c'];
      component.createProduct();
      expect(updateProduct).not.toHaveBeenCalled();
    });

    it('createProduct error muestra toast de error', () => {
      updateProduct.mockReturnValue(throwError(() => ({ message: 'fail' })));
      component.createProductForm.patchValue({
        title: 'Actualizado',
        description: 'Nueva desc',
      });
      component.imgCodes = ['code-a'];
      component.createProduct();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('variaciones extra', () => {
    it('addVariationOption con valor debe añadir opción', () => {
      component.addVariation();
      const group = component.variationsFormArray.at(0);
      group.get('newOption')?.setValue('  talla M  ');
      component.addVariationOption(group);
      expect(component.getVariationOptionsFormArray(group).length).toBe(1);
    });

    it('removeVariationOption elimina por índice', () => {
      component.addColorVariation();
      const group = component.variationsFormArray.at(0);
      component.onPredefinedOptionsChange(group, ['red']);
      component.removeVariationOption(group, 0);
      expect(component.getVariationOptionsFormArray(group).length).toBe(0);
    });

    it('getPredefinedOptions devuelve tallas para variación size', () => {
      component.addSizeVariation();
      const group = component.variationsFormArray.at(0);
      expect(component.getPredefinedOptions(group).length).toBeGreaterThan(0);
    });

    it('hasPredefinedOptions detecta color o size', () => {
      component.addColorVariation();
      expect(component.hasPredefinedOptions(component.variationsFormArray.at(0))).toBe(
        true,
      );
    });
  });

  describe('getProduct error', () => {
    beforeEach(async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      TestBed.resetTestingModule();
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
                  idProduct: '777',
                },
                paramMap: convertToParamMap({
                  business: 'test-business',
                  catalogPath: 'my-cat',
                  idProduct: '777',
                }),
              },
            },
          },
          TranslateService,
          TranslateStore,
          { provide: DialogService, useValue: { open: jest.fn() } },
          { provide: MessageService, useValue: { add: jest.fn() } },
          { provide: Apollo, useValue: apolloMock },
          {
            provide: BusinessPrivateService,
            useValue: { getBusinessByPath: jest.fn(() => of({ id: 1, path: 'test-business' })) },
          },
          {
            provide: CatalogPrivateService,
            useValue: { findOneCatalogByPath: jest.fn(() => of({ id: 99, path: 'my-cat' })) },
          },
          {
            provide: ProductPrivateService,
            useValue: {
              createProduct: jest.fn(),
              findOneProduct: jest.fn(() => throwError(() => new Error('not found'))),
              updateProduct: jest.fn(),
            },
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
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('getProduct error registra en consola y libera attempt', () => {
      expect(component.attempt).toBe(false);
      expect(component.product).toBeUndefined();
    });
  });

  /**
   * Abre el modal de generación IA; al cerrar con HTML setea description.
   */
  describe('openGenerateDescriptionModal', () => {
    it('sin título no abre el modal y muestra toast de validación', () => {
      component.createProductForm.patchValue({ title: '' });
      component.openGenerateDescriptionModal();
      expect(dialogOpen).not.toHaveBeenCalled();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn' }),
      );
    });

    it('abre el modal con título, subtítulo e imageUrls', () => {
      component.createProductForm.patchValue({
        title: 'Zapatillas',
        subtitle: 'Running',
        description: '',
      });
      component.urls = ['https://cdn.example/a.png'];
      component.openGenerateDescriptionModal();
      expect(dialogOpen).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          data: {
            title: 'Zapatillas',
            subtitle: 'Running',
            imageUrls: ['https://cdn.example/a.png'],
          },
        }),
      );
      expect(component.isAiModalOpen).toBe(false);
    });

    it('al cerrar el modal con HTML setea description', () => {
      dialogOpen.mockReturnValue({
        onClose: of('<p>Descripción generada</p>'),
      });
      component.createProductForm.patchValue({
        title: 'Producto',
        description: '',
      });
      component.openGenerateDescriptionModal();
      expect(component.createProductForm.get('description')?.value).toBe(
        '<p>Descripción generada</p>',
      );
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
      expect(component.isAiModalOpen).toBe(false);
    });
  });

  describe('onboarding flow', () => {
    let storageRemove: jest.Mock;

    beforeEach(async () => {
      storageRemove = jest.fn();
      navigate = jest.fn();
      TestBed.resetTestingModule();
      const { mock: apolloMock } = createApolloMock();
      await TestBed.configureTestingModule({
        imports: [CreateProductPage, TranslateModule.forRoot(), HttpClientTestingModule],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                params: { business: 'test-business', catalogPath: 'my-cat' },
                paramMap: convertToParamMap({
                  business: 'test-business',
                  catalogPath: 'my-cat',
                }),
                data: { onboardingFlow: true },
              },
              parent: null,
            },
          },
          TranslateService,
          TranslateStore,
          { provide: DialogService, useValue: { open: jest.fn() } },
          { provide: MessageService, useValue: { add: jest.fn() } },
          { provide: Apollo, useValue: apolloMock },
          {
            provide: BusinessPrivateService,
            useValue: { getBusinessByPath: jest.fn(() => of({ id: 1, path: 'test-business' })) },
          },
          {
            provide: CatalogPrivateService,
            useValue: { findOneCatalogByPath: jest.fn(() => of({ id: 99, path: 'my-cat' })) },
          },
          {
            provide: ProductPrivateService,
            useValue: {
              createProduct: jest.fn(() => of({ id: 600 })),
              findOneProduct: jest.fn(),
              updateProduct: jest.fn(),
            },
          },
          {
            provide: UtilsService,
            useValue: {
              normalizeSpaces: (s: string) => String(s ?? '').trim(),
              navigate,
              blobToFile: jest.fn(),
              getExtensionFile: jest.fn(() => 'png'),
            },
          },
          {
            provide: BusinessApiFilePrivateService,
            useValue: { post: jest.fn(() => of({})) },
          },
          {
            provide: StorageService,
            useValue: { remove: storageRemove },
          },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(CreateProductPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('create exitoso en onboarding limpia storage pendiente', () => {
      component.createProductForm.patchValue({
        title: 'Onboarding product',
        description: 'Descripción mínima onboarding',
      });
      component.imgCodes = ['img-code-1'];
      component.catalog = { id: 99, path: 'my-cat' } as any;
      component.createProduct();
      expect(storageRemove).toHaveBeenCalledWith('businessOnboardingPending');
    });
  });
});
