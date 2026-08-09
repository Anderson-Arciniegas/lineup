import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  AuthStore,
  DiscountPrivateService,
  DiscountScopeEnum,
  DiscountTypeEnum,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, of } from 'rxjs';
import { DiscountPage } from './discount-page';

describe('DiscountPage', () => {
  let component: DiscountPage;
  let fixture: ComponentFixture<DiscountPage>;
  let dialogOpen: jest.Mock;
  let onClose$: Subject<boolean>;
  let navigate: jest.Mock;
  let removeDiscount: jest.Mock;

  beforeEach(async () => {
    onClose$ = new Subject<boolean>();
    dialogOpen = jest.fn(() => ({ onClose: onClose$.asObservable() }));
    navigate = jest.fn();
    removeDiscount = jest.fn(() => of(true));

    await TestBed.configureTestingModule({
      imports: [DiscountPage, TranslateModule.forRoot(), RouterTestingModule.withRoutes([])],
      providers: [
        TranslateService,
        TranslateStore,
        { provide: MessageService, useValue: { add: jest.fn() } },
        { provide: DialogService, useValue: { open: dialogOpen } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
        {
          provide: AuthStore,
          useValue: { business: () => ({ id: 1, path: 'test' }) },
        },
        {
          provide: DiscountPrivateService,
          useValue: {
            findOneDiscount: () =>
              of({
                id: 1,
                discountType: DiscountTypeEnum.PERCENTAGE,
                scope: DiscountScopeEnum.CATALOG,
                value: 10,
                startDate: '',
                endDate: '',
                status: 'ACTIVE',
                discountProducts: [],
              }),
            removeDiscount,
          },
        },
        { provide: UtilsService, useValue: { navigate } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear y cargar descuento', () => {
    expect(component).toBeTruthy();
    expect(component.discount?.id).toBe(1);
  });

  it('scopeLabelKey devuelve claves i18n', () => {
    expect(component.scopeLabelKey(DiscountScopeEnum.BUSINESS)).toBe(
      'general.discountScopeBusiness',
    );
    expect(component.scopeLabelKey(DiscountScopeEnum.CATALOG)).toBe(
      'general.discountScopeCatalog',
    );
  });

  it('typeLabelKey distingue porcentaje y fijo', () => {
    expect(component.typeLabelKey(DiscountTypeEnum.PERCENTAGE)).toBe(
      'general.discountTypePercentage',
    );
    expect(component.typeLabelKey(DiscountTypeEnum.FIXED)).toBe(
      'general.discountTypeFixed',
    );
  });

  it('onEdit navega a edición', () => {
    component.onEdit();
    expect(navigate).toHaveBeenCalled();
  });

  it('onDelete confirma y elimina', () => {
    component.onDelete();
    onClose$.next(true);
    expect(removeDiscount).toHaveBeenCalledWith(1);
  });
});

describe('DiscountPage id inválido', () => {
  it('debe mostrar error con id no numérico', async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountPage, TranslateModule.forRoot(), RouterTestingModule],
      providers: [
        TranslateService,
        TranslateStore,
        { provide: MessageService, useValue: { add: jest.fn() } },
        { provide: DialogService, useValue: { open: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'abc' } } },
        },
        { provide: AuthStore, useValue: { business: () => ({ id: 1 }) } },
        {
          provide: DiscountPrivateService,
          useValue: { findOneDiscount: jest.fn() },
        },
        { provide: UtilsService, useValue: { navigate: jest.fn() } },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(DiscountPage);
    fix.detectChanges();
    expect(fix.componentInstance.errorMessage).toBeTruthy();
  });
});
