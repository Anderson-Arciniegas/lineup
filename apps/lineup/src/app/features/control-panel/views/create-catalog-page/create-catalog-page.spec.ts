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
  });
});
