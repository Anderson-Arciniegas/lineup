import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogPrivateService, StatusEnum } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { SelectCatalogModal } from './select-catalog-modal';

describe('SelectCatalogModal', () => {
  let component: SelectCatalogModal;
  let fixture: ComponentFixture<SelectCatalogModal>;
  let catalogService: jest.Mocked<Pick<CatalogPrivateService, 'findAllMyCatalogs'>>;

  beforeEach(async () => {
    catalogService = {
      findAllMyCatalogs: jest.fn().mockReturnValue(
        of({
          items: [
            {
              id: 1,
              idCreationBusiness: 1,
              path: 'c1',
              productsCount: 0,
              status: StatusEnum.ACTIVE,
              title: 'Cat A',
              visits: 0,
              __typename: 'CatalogSchema',
            },
          ],
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [SelectCatalogModal, TranslateModule.forRoot()],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: {} } },
        { provide: CatalogPrivateService, useValue: catalogService },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectCatalogModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load catalogs via service when data.catalogs is not provided', () => {
    expect(catalogService.findAllMyCatalogs).toHaveBeenCalledWith({
      page: 1,
      limit: 200,
    });
  });

  it('should close with catalog id when a catalog is selected', () => {
    const ref = TestBed.inject(DynamicDialogRef) as DynamicDialogRef & {
      close: jest.Mock;
    };
    component.select({
      id: 42,
      idCreationBusiness: 1,
      path: 'x',
      productsCount: 0,
      status: StatusEnum.ACTIVE,
      title: 'T',
      visits: 0,
      __typename: 'CatalogSchema',
    });
    expect(ref.close).toHaveBeenCalledWith(42);
  });

  it('should use preloaded catalogs when data.catalogs is set', async () => {
    catalogService.findAllMyCatalogs.mockClear();
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SelectCatalogModal, TranslateModule.forRoot()],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: {
              catalogs: [
                {
                  id: 9,
                  idCreationBusiness: 1,
                  path: 'p',
                  productsCount: 0,
                  status: StatusEnum.ACTIVE,
                  title: 'Pre',
                  visits: 0,
                  __typename: 'CatalogSchema' as const,
                },
              ],
            },
          },
        },
        { provide: CatalogPrivateService, useValue: catalogService },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    const f = TestBed.createComponent(SelectCatalogModal);
    f.detectChanges();
    expect(catalogService.findAllMyCatalogs).not.toHaveBeenCalled();
    expect(f.componentInstance.catalogs().length).toBe(1);
    expect(f.componentInstance.catalogs()[0].id).toBe(9);
  });

  it('should set loadError when service fails', async () => {
    catalogService.findAllMyCatalogs.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SelectCatalogModal, TranslateModule.forRoot()],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: {} } },
        { provide: CatalogPrivateService, useValue: catalogService },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    const f = TestBed.createComponent(SelectCatalogModal);
    f.detectChanges();
    expect(f.componentInstance.loadError()).toBe(true);
    expect(f.componentInstance.loading()).toBe(false);
  });
});
