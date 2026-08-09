import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LocationSchema, StatusEnum } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { BusinessLocationsModal } from './business-locations-modal';
import { LocationModal } from '../location-modal/location-modal';

describe('BusinessLocationsModal', () => {
  let component: BusinessLocationsModal;
  let fixture: ComponentFixture<BusinessLocationsModal>;
  let dialogRef: { close: jest.Mock };
  let dialogService: { open: jest.Mock };

  const locations: LocationSchema[] = [
    {
      id: 1,
      name: 'Principal',
      address: 'Av. Principal, Caracas, Venezuela, 1010',
      formattedAddress: 'Av. Principal, Caracas',
      addressComponents: '',
      lat: 10.5,
      lng: -66.9,
      idCreationBusiness: 1,
      status: StatusEnum.ACTIVE,
      business: { name: 'LineUp Store' } as LocationSchema['business'],
    },
  ];

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    dialogService = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [BusinessLocationsModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { locations, businessName: 'LineUp Store' } },
        },
        { provide: DialogService, useValue: dialogService },
      ],
    })
      .overrideComponent(BusinessLocationsModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(BusinessLocationsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar las ubicaciones desde la config', () => {
    expect(component.locations()).toEqual(locations);
  });

  it('debe calcular businessName desde la config explícita', () => {
    expect(component.businessName()).toBe('LineUp Store');
  });

  describe('getShortAddress', () => {
    it('debe acortar la dirección a las tres primeras partes', () => {
      expect(component.getShortAddress('A, B, C, D')).toBe('A,  B,  C');
    });

    it('debe devolver cadena vacía si no hay dirección', () => {
      expect(component.getShortAddress(null)).toBe('');
    });
  });

  it('debe abrir LocationModal y cerrar el modal actual', () => {
    component.openLocation(locations[0]);
    expect(dialogService.open).toHaveBeenCalledWith(
      LocationModal,
      expect.objectContaining({
        data: { location: locations[0], myLocation: false },
      }),
    );
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('debe cerrar el diálogo al invocar close', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});

describe('BusinessLocationsModal sin businessName', () => {
  let component: BusinessLocationsModal;
  let fixture: ComponentFixture<BusinessLocationsModal>;

  const locations: LocationSchema[] = [
    {
      id: 2,
      name: 'Sucursal',
      address: 'Calle 2',
      formattedAddress: 'Calle 2',
      addressComponents: '',
      lat: 10.4,
      lng: -66.8,
      idCreationBusiness: 1,
      status: StatusEnum.ACTIVE,
      business: { name: 'Desde Location' } as LocationSchema['business'],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessLocationsModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: { locations } } },
        { provide: DialogService, useValue: { open: jest.fn() } },
      ],
    })
      .overrideComponent(BusinessLocationsModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(BusinessLocationsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe inferir businessName desde la primera ubicación', () => {
    expect(component.businessName()).toBe('Desde Location');
    expect(component.title()).toContain('Desde Location');
  });

  it('debe usar título genérico sin nombre', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [BusinessLocationsModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: { locations: [] } } },
        { provide: DialogService, useValue: { open: jest.fn() } },
      ],
    })
      .overrideComponent(BusinessLocationsModal, { set: { template: '' } })
      .compileComponents();
    const fix = TestBed.createComponent(BusinessLocationsModal);
    const cmp = fix.componentInstance;
    fix.detectChanges();
    expect(cmp.businessName()).toBe('');
    expect(cmp.title()).toBeTruthy();
  });
});
