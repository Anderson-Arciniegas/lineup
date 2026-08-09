import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, CatalogPrivateService, UtilsService } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { CatalogsPage } from './catalogs-page';

describe('CatalogsPage', () => {
  let component: CatalogsPage;
  let fixture: ComponentFixture<CatalogsPage>;
  let findAllMyCatalogs: jest.Mock;

  beforeEach(async () => {
    findAllMyCatalogs = jest
      .fn()
      .mockReturnValueOnce(
        of({
          items: [{ id: 1, title: 'Cat 1', path: 'cat-1' }],
          page: 1,
          limit: 20,
          total: 1,
        }),
      )
      .mockReturnValueOnce(
        of({ items: [], page: 2, limit: 20, total: 1 }),
      );

    await TestBed.configureTestingModule({
      imports: [CatalogsPage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        MessageService,
        DialogService,
        { provide: UtilsService, useValue: { navigate: jest.fn() } },
        {
          provide: AuthStore,
          useValue: {
            business: () => ({ id: 1, path: 'shop', name: 'Shop' }),
          },
        },
        {
          provide: CatalogPrivateService,
          useValue: { findAllMyCatalogs },
        },
        { provide: Apollo, useValue: createApolloMock().mock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('getCatalogs', () => {
    it('debe cargar catálogos y negocio al iniciar', () => {
      expect(findAllMyCatalogs).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(component.catalogs.length).toBe(1);
      expect(component.business?.path).toBe('shop');
      expect(component.attempt).toBe(false);
    });

    it('debe paginar hasta recibir página vacía', () => {
      component.getCatalogs();
      expect(findAllMyCatalogs).toHaveBeenCalledWith({ page: 2, limit: 20 });
      expect(component.noMoreResults).toBe(true);
    });

    it('no debe cargar si noMoreResults es true', () => {
      findAllMyCatalogs.mockClear();
      component.noMoreResults = true;
      component.getCatalogs();
      expect(findAllMyCatalogs).not.toHaveBeenCalled();
    });

    it('debe resetear attempt tras error', () => {
      findAllMyCatalogs.mockReturnValueOnce(
        throwError(() => new Error('fail')),
      );
      component.noMoreResults = false;
      component.attempt = false;
      component.getCatalogs();
      expect(component.attempt).toBe(false);
    });
  });
});
