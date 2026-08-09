import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LocationSchema, StatusEnum } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LocationModal } from './location-modal';

function setupGoogleMapsMock() {
  const latLng = (lat: number, lng: number) => ({ lat: () => lat, lng: () => lng });
  (window as unknown as { google: { maps: object } }).google = {
    maps: {
      LatLng: jest.fn((lat: number, lng: number) => latLng(lat, lng)),
      Map: jest.fn(() => ({ setCenter: jest.fn(), setZoom: jest.fn() })),
      Marker: jest.fn(() => ({ setPosition: jest.fn(), setMap: jest.fn() })),
    },
  };
}

describe('LocationModal', () => {
  let component: LocationModal;
  let fixture: ComponentFixture<LocationModal>;
  let dialogRef: { close: jest.Mock };

  const location: LocationSchema = {
    id: 5,
    name: 'Sucursal',
    address: 'Calle 1',
    formattedAddress: 'Calle 1, Caracas',
    addressComponents: '',
    lat: 10.48,
    lng: -66.9,
    idCreationBusiness: 1,
    status: StatusEnum.ACTIVE,
  };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LocationModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { location, myLocation: true } },
        },
      ],
    })
      .overrideComponent(LocationModal, {
        set: { template: '<div #mapContainer></div>' },
      })
      .compileComponents();

    setupGoogleMapsMock();
    fixture = TestBed.createComponent(LocationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as unknown as { google?: unknown }).google;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar la ubicación desde la config en ngOnInit', () => {
    expect(component.location()).toEqual(location);
    expect(component.myLocation).toBe(true);
  });

  it('debe inicializar mapa con google maps', () => {
    const container = document.createElement('div');
    (component as unknown as { mapContainer: () => { nativeElement: HTMLElement } }).mapContainer =
      () => ({ nativeElement: container }) as ElementRef<HTMLElement>;
    setupGoogleMapsMock();
    (component as unknown as { initMap: () => void }).initMap();
    expect(component.isMapReady()).toBe(true);
    expect(component.isMapLoading()).toBe(false);
  });

  it('debe cerrar el diálogo al invocar close', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('debe cerrar con flag edit al editar', () => {
    component.editLocation();
    expect(dialogRef.close).toHaveBeenCalledWith({ edit: true });
  });

  it('debe cerrar con flag delete al eliminar', () => {
    component.deleteLocation();
    expect(dialogRef.close).toHaveBeenCalledWith({ delete: true });
  });

  it('debe abrir Google Maps con las coordenadas de la ubicación', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    component.openInGoogleMaps();
    expect(openSpy).toHaveBeenCalledWith(
      'https://www.google.com/maps?q=10.48,-66.9',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });
});

describe('LocationModal sin ubicación', () => {
  let component: LocationModal;
  let fixture: ComponentFixture<LocationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: {} } },
      ],
    })
      .overrideComponent(LocationModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(LocationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe detener carga si no hay ubicación en config', () => {
    expect(component.isMapLoading()).toBe(false);
    expect(component.location()).toBeNull();
  });

  it('no debe abrir maps sin ubicación', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    component.openInGoogleMaps();
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });
});

describe('LocationModal carga de script', () => {
  let component: LocationModal;
  let fixture: ComponentFixture<LocationModal>;

  const location: LocationSchema = {
    id: 5,
    name: 'Sucursal',
    address: 'Calle 1',
    formattedAddress: 'Calle 1, Caracas',
    addressComponents: '',
    lat: 10.48,
    lng: -66.9,
    idCreationBusiness: 1,
    status: StatusEnum.ACTIVE,
  };

  beforeEach(async () => {
    delete (window as unknown as { google?: unknown }).google;

    await TestBed.configureTestingModule({
      imports: [LocationModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { location, myLocation: false } },
        },
      ],
    })
      .overrideComponent(LocationModal, {
        set: { template: '<div #mapContainer></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LocationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe cargar script de Google Maps si no está presente', fakeAsync(() => {
    const script = document.querySelector('script[src*="maps"]');
    expect(script).toBeTruthy();
    script?.dispatchEvent(new Event('load'));
    tick(0);
    setupGoogleMapsMock();
    tick(0);
    expect(component.isMapLoading()).toBe(false);
  }));

  it('debe detener carga si initMap no tiene google maps', () => {
    (component as unknown as { initMap: () => void }).initMap();
    expect(component.isMapReady()).toBe(false);
  });
});