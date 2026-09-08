import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  BusinessPrivateService,
  CatalogPrivateService,
  CurrencyPrivateService,
  ProductPrivateService,
  StorageService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { UpdateProductSkuPage } from './update-product-sku-page';

describe('UpdateProductSkuPage', () => {
  let component: UpdateProductSkuPage;
  let fixture: ComponentFixture<UpdateProductSkuPage>;
  let updateProductSkus: jest.Mock;
  let messageAdd: jest.Mock;
  let navigate: jest.Mock;
  let storageGet: jest.Mock;
  let storageRemove: jest.Mock;

  const productMock = {
    id: 1,
    title: 'P',
    business: { id: 1, path: 'mi-negocio' },
    skus: [
      { id: 10, idCurrency: 1, price: 9.99, quantity: 3 },
      { id: 11, idCurrency: null, price: null, quantity: 1 },
    ],
    productFiles: [],
  };

  beforeEach(async () => {
    updateProductSkus = jest.fn(() => of({}));
    messageAdd = jest.fn();
    navigate = jest.fn();
    storageGet = jest.fn(() => null);
    storageRemove = jest.fn();

    await TestBed.configureTestingModule({
      imports: [UpdateProductSkuPage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        TranslateService,
        TranslateStore,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { business: 'test', idProduct: '1', catalogPath: 'cat' },
            },
          },
        },
        { provide: Apollo, useValue: createApolloMock().mock },
        {
          provide: BusinessPrivateService,
          useValue: { getBusinessByPath: () => of({ id: 1, path: 'test' }) },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            findOneProduct: () => of(productMock as any),
            updateProductSkus,
          },
        },
        {
          provide: CurrencyPrivateService,
          useValue: {
            findAllCurrencies: () =>
              of([{ id: 1, code: 'USD', name: 'Dollar' } as any]),
          },
        },
        { provide: CatalogPrivateService, useValue: {} },
        {
          provide: UtilsService,
          useValue: { navigate },
        },
        {
          provide: StorageService,
          useValue: { get: storageGet, remove: storageRemove },
        },
        { provide: MessageService, useValue: { add: messageAdd } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateProductSkuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Tras cargar producto, el FormArray refleja cada SKU.
   */
  describe('carga de SKUs', () => {
    it('debe construir un control por SKU', () => {
      expect(component.product?.skus?.length).toBe(2);
      expect(component.skusFormArray.length).toBe(2);
    });

    it('debe dejar image undefined sin productFiles', () => {
      expect(component.image).toBeUndefined();
    });
  });

  /**
   * `applyGeneralToAllSkus` propaga moneda y precio del bloque general.
   */
  describe('applyGeneralToAllSkus', () => {
    it('debe actualizar todos los grupos de SKU', () => {
      component.generalFormGroup.patchValue({ idCurrency: 2, price: 19.5 });
      component.applyGeneralToAllSkus();
      const rows = component.skusFormArray.controls.map(
        (c) => (c as any).getRawValue(),
      );
      expect(rows.every((r) => r.idCurrency === 2 && r.price === 19.5)).toBe(
        true,
      );
    });
  });

  /**
   * Persistencia vía `updateProductSkus`.
   */
  describe('updateProductSku', () => {
    it('debe llamar al servicio con los valores del formulario', () => {
      component.updateProductSku();
      expect(updateProductSkus).toHaveBeenCalledWith({
        skus: expect.arrayContaining([
          expect.objectContaining({ id: 10 }),
          expect.objectContaining({ id: 11 }),
        ]),
      });
    });

    it('debe avisar si no hay SKUs que actualizar', () => {
      component.skusFormArray.clear();
      component.updateProductSku();
      expect(updateProductSkus).not.toHaveBeenCalled();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn' }),
      );
    });

    it('sin onboarding navega al panel privado del producto', () => {
      storageGet.mockReturnValue(null);
      component.updateProductSku();
      expect(storageRemove).not.toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(['dashboard', 'catalogs', 'cat', '1']);
    });

    it('con onboarding limpia el flag y navega al perfil público', () => {
      storageGet.mockReturnValue(true);
      component.updateProductSku();
      expect(storageRemove).toHaveBeenCalledWith('businessOnboardingPending');
      expect(navigate).toHaveBeenCalledWith(['mi-negocio']);
    });

    it('con onboarding sin path de negocio navega al dashboard', () => {
      storageGet.mockReturnValue(true);
      component.business = undefined as unknown as typeof component.business;
      component.product = {
        ...productMock,
        business: undefined,
      } as typeof component.product;
      component.updateProductSku();
      expect(storageRemove).toHaveBeenCalledWith('businessOnboardingPending');
      expect(navigate).toHaveBeenCalledWith(['dashboard']);
    });
  });
});
