import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  BusinessPrivateService,
  BusinessApiFilePrivateService,
  CatalogPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { CreateCatalogPage } from './create-catalog-page';

describe('CreateCatalogPage', () => {
  let fixture: ComponentFixture<CreateCatalogPage>;
  let component: CreateCatalogPage;
  let createCatalog: jest.Mock;
  let navigate: jest.Mock;

  function setupRoute(params: Record<string, string>) {
    TestBed.resetTestingModule();
    createCatalog = jest.fn(() => of({ id: 1, path: 'nuevo-cat' }));
    navigate = jest.fn();
    const authStoreMock = {
      business: () => ({ id: 10, path: 'biz' }),
    };

    return TestBed.configureTestingModule({
      imports: [CreateCatalogPage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params } } },
        TranslateService,
        TranslateStore,
        { provide: DialogService, useValue: { open: jest.fn(() => ({ onClose: of(undefined) })) } },
        { provide: MessageService, useValue: { add: jest.fn() } },
        { provide: Apollo, useValue: createApolloMock().mock },
        { provide: AuthStore, useValue: authStoreMock },
        {
          provide: CatalogPrivateService,
          useValue: {
            createCatalog,
            findOneCatalogByPath: jest.fn(),
            updateCatalog: jest.fn(),
          },
        },
        {
          provide: BusinessPrivateService,
          useValue: { getBusinessByPath: jest.fn() },
        },
        {
          provide: BusinessApiFilePrivateService,
          useValue: { post: jest.fn(() => of({})) },
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
      ],
    }).compileComponents();
  }

  describe('modo creación (sin catalogPath)', () => {
    beforeEach(async () => {
      await setupRoute({});
      fixture = TestBed.createComponent(CreateCatalogPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('debe crear el componente y formulario', () => {
      expect(component).toBeTruthy();
      expect(component.createCatalogForm).toBeDefined();
    });

    /**
     * `createCatalog()` envía título y datos al servicio cuando el formulario es válido.
     */
    it('debe llamar createCatalog con título normalizado', () => {
      component.createCatalogForm.patchValue({
        catalogName: '  Mi catálogo  ',
        hexColor: '#ffffff',
      });
      component.imgCode = 'code-img';
      component.createCatalog();
      expect(createCatalog).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Mi catálogo',
          imageCode: 'code-img',
        }),
      );
    });

    it('no debe enviar si el formulario es inválido', () => {
      component.createCatalogForm.patchValue({ catalogName: '' });
      component.createCatalog();
      expect(createCatalog).not.toHaveBeenCalled();
    });

    it('no debe enviar sin imagen', () => {
      component.createCatalogForm.patchValue({ catalogName: 'Cat' });
      component.imgCode = '';
      component.createCatalog();
      expect(createCatalog).not.toHaveBeenCalled();
    });

    it('addTag y removeTag gestionan etiquetas', () => {
      component.createCatalogForm.patchValue({ tag: ' verano , VERANO ' });
      component.addTag();
      expect(component.tags).toEqual(['verano']);
      component.removeTag(0);
      expect(component.tags).toEqual([]);
    });

    it('setColor actualiza hexColor', () => {
      component.setColor({ value: '#ff0000' });
      expect(component.createCatalogForm.get('hexColor')?.value).toBe('#ff0000');
    });
  });

  describe('modo edición', () => {
    let updateCatalog: jest.Mock;
    let findOneCatalogByPath: jest.Mock;

    beforeEach(async () => {
      updateCatalog = jest.fn(() => of({ id: 2, path: 'edit-cat' }));
      findOneCatalogByPath = jest.fn(() =>
        of({
          id: 2,
          title: 'Cat existente',
          path: 'edit-cat',
          hexColor: '#aabbcc',
          tags: ['tag1'],
          image: { name: 'img-code', url: 'https://img/x.png' },
        }),
      );
      createCatalog = jest.fn();
      navigate = jest.fn();
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CreateCatalogPage, TranslateModule.forRoot(), HttpClientTestingModule],
        providers: [
          { provide: ActivatedRoute, useValue: { snapshot: { params: { catalogPath: 'edit-cat' } } } },
          TranslateService,
          TranslateStore,
          { provide: DialogService, useValue: { open: jest.fn(() => ({ onClose: of(undefined) })) } },
          { provide: MessageService, useValue: { add: jest.fn() } },
          { provide: Apollo, useValue: createApolloMock().mock },
          { provide: AuthStore, useValue: { business: () => ({ id: 10, path: 'biz' }) } },
          {
            provide: CatalogPrivateService,
            useValue: { createCatalog, findOneCatalogByPath, updateCatalog },
          },
          { provide: BusinessPrivateService, useValue: { getBusinessByPath: jest.fn() } },
          {
            provide: BusinessApiFilePrivateService,
            useValue: { post: jest.fn(() => of({})) },
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
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(CreateCatalogPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('debe cargar catálogo y rellenar formulario', () => {
      expect(findOneCatalogByPath).toHaveBeenCalledWith('edit-cat');
      expect(component.catalog?.title).toBe('Cat existente');
      expect(component.tags).toEqual(['tag1']);
    });

    it('debe actualizar catálogo existente', () => {
      component.createCatalogForm.patchValue({ catalogName: 'Nuevo título' });
      component.createCatalog();
      expect(updateCatalog).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalled();
    });
  });
});
