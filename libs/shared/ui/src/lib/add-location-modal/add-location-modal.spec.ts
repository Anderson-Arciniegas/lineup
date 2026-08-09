import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LocationsPrivateService, StatusEnum } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { AddLocationModal } from './add-location-modal';

function createLatLng(lat: number, lng: number) {
  return { lat: () => lat, lng: () => lng };
}

function setupGoogleMapsMock() {
  const latLngFactory = (lat: number, lng: number) => createLatLng(lat, lng);
  const geocodeMock = jest.fn((_req: unknown, cb: (results: unknown[], status: string) => void) => {
    cb(
      [
        {
          formatted_address: 'Caracas, Venezuela',
          geometry: { location: latLngFactory(10.5, -66.9) },
        },
      ],
      'OK',
    );
  });

  const maps = {
    LatLng: jest.fn((lat: number, lng: number) => latLngFactory(lat, lng)),
    Map: jest.fn(() => ({
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      addListener: jest.fn(),
    })),
    Marker: jest.fn(() => ({
      setPosition: jest.fn(),
      getPosition: jest.fn(() => latLngFactory(10.5, -66.9)),
      setMap: jest.fn(),
      addListener: jest.fn(),
    })),
    Geocoder: jest.fn(() => ({ geocode: geocodeMock })),
    places: {
      AutocompleteService: jest.fn(() => ({
        getPlacePredictions: jest.fn(
          (_req: unknown, cb: (predictions: unknown[] | null, status: string) => void) => {
            cb([{ place_id: 'p1', description: 'Caracas, VE' }], 'OK');
          },
        ),
      })),
      PlacesService: jest.fn(() => ({
        getDetails: jest.fn(
          (_req: unknown, cb: (place: unknown, status: string) => void) => {
            cb(
              {
                formatted_address: 'Caracas, VE',
                geometry: { location: latLngFactory(10.5, -66.9) },
              },
              'OK',
            );
          },
        ),
      })),
    },
  };

  (window as unknown as { google: { maps: typeof maps } }).google = { maps };
  return { maps, geocodeMock };
}

describe('AddLocationModal', () => {
  let component: AddLocationModal;
  let fixture: ComponentFixture<AddLocationModal>;
  let dialogRef: { close: jest.Mock };
  let locationsService: {
    createLocation: jest.Mock;
    updateLocation: jest.Mock;
  };

  const mapTemplate = '<div #mapContainer id="map"></div>';

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    locationsService = {
      createLocation: jest.fn(() => of({ id: 1, name: 'Sede' })),
      updateLocation: jest.fn(() => of({ id: 2, name: 'Sede editada' })),
    };

    await TestBed.configureTestingModule({
      imports: [AddLocationModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: dialogRef },
        { provide: DynamicDialogConfig, useValue: { data: {} } },
        { provide: LocationsPrivateService, useValue: locationsService },
      ],
    })
      .overrideComponent(AddLocationModal, { set: { template: mapTemplate } })
      .compileComponents();

    setupGoogleMapsMock();
    fixture = TestBed.createComponent(AddLocationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as unknown as { google?: unknown }).google;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('validación del nombre', () => {
    it('debe considerar inválido un nombre vacío', () => {
      component.locationName.set('   ');
      expect(component.locationNameValid()).toBe(false);
    });

    it('debe considerar inválido un nombre que excede la longitud máxima', () => {
      component.locationName.set('a'.repeat(26));
      expect(component.locationNameExceedsMax()).toBe(true);
      expect(component.locationNameValid()).toBe(false);
    });

    it('debe actualizar locationName con onNameInput', () => {
      component.onNameInput('Sede central');
      expect(component.locationName()).toBe('Sede central');
      expect(component.locationNameValid()).toBe(true);
    });
  });

  describe('búsqueda de lugares', () => {
    beforeEach(() => {
      const { maps } = setupGoogleMapsMock();
      (component as unknown as { autocompleteService: unknown }).autocompleteService =
        new (maps.places.AutocompleteService as unknown as new () => unknown)();
      (component as unknown as { geocoder: unknown }).geocoder =
        new (maps.Geocoder as unknown as new () => unknown)();
      (component as unknown as { map: unknown; marker: unknown }).map =
        new (maps.Map as unknown as new (...args: unknown[]) => unknown)(
          document.createElement('div'),
        );
      (component as unknown as { marker: unknown }).marker =
        new (maps.Marker as unknown as new () => unknown)();
      (component as unknown as { placesService: unknown }).placesService =
        new (maps.places.PlacesService as unknown as new (...args: unknown[]) => unknown)({});
    });

    it('debe limpiar predicciones si el texto tiene menos de 2 caracteres', () => {
      component.placePredictions.set([{ place_id: '1', description: 'Test' }]);
      component.onSearchInput('a');
      expect(component.placePredictions()).toEqual([]);
    });

    it('debe obtener predicciones tras debounce', fakeAsync(() => {
      component.onSearchInput('Caracas');
      tick(350);
      expect(component.placePredictions().length).toBeGreaterThan(0);
    }));

    it('debe limpiar predicciones si autocomplete devuelve error', fakeAsync(() => {
      const { maps } = setupGoogleMapsMock();
      maps.places.AutocompleteService = jest.fn(() => ({
        getPlacePredictions: jest.fn(
          (_req: unknown, cb: (predictions: unknown[] | null, status: string) => void) => {
            cb(null, 'ZERO_RESULTS');
          },
        ),
      })) as unknown as typeof maps.places.AutocompleteService;
      (component as unknown as { autocompleteService: unknown }).autocompleteService =
        new (maps.places.AutocompleteService as unknown as new () => unknown)();
      component.onSearchInput('Nowhere');
      tick(350);
      expect(component.placePredictions()).toEqual([]);
    }));

    it('debe cerrar predicciones con closePredictions', () => {
      component.placePredictions.set([{ place_id: '1', description: 'Test' }]);
      component.closePredictions();
      expect(component.placePredictions()).toEqual([]);
    });

    it('debe programar y cancelar cierre de predicciones', fakeAsync(() => {
      component.placePredictions.set([{ place_id: '1', description: 'Test' }]);
      component.scheduleClosePredictions();
      component.cancelClosePredictions();
      tick(200);
      expect(component.placePredictions()).toHaveLength(1);
    }));

    it('debe seleccionar primera predicción en onSearchSubmit', () => {
      component.placePredictions.set([{ place_id: 'p1', description: 'Caracas' }]);
      component.onSearchSubmit();
      expect(component.placePredictions()).toEqual([]);
    });

    it('debe geocodificar query sin predicciones', () => {
      component.onSearchSubmit('Caracas Venezuela');
      expect(component.searchQuery()).toBeTruthy();
    });

    it('no debe hacer nada en submit sin query ni predicciones', () => {
      component.placePredictions.set([]);
      component.searchQuery.set('   ');
      component.onSearchSubmit();
      expect(component.selectedLocation()).toBeNull();
    });

    it('debe limpiar predicciones si autocomplete no está disponible', fakeAsync(() => {
      (component as unknown as { autocompleteService: null }).autocompleteService = null;
      component.onSearchInput('Caracas');
      tick(350);
      expect(component.placePredictions()).toEqual([]);
    }));

    it('debe cerrar predicciones tras scheduleClosePredictions', fakeAsync(() => {
      component.placePredictions.set([{ place_id: '1', description: 'Test' }]);
      component.scheduleClosePredictions();
      tick(200);
      expect(component.placePredictions()).toEqual([]);
    }));
  });

  describe('mapa e inicialización', () => {
    it('debe marcar mapa listo tras initMap manual', () => {
      const container = document.createElement('div');
      (component as unknown as { mapContainer: () => { nativeElement: HTMLElement } }).mapContainer =
        () => ({ nativeElement: container }) as ElementRef<HTMLElement>;
      setupGoogleMapsMock();
      (component as unknown as { initMap: () => void }).initMap();
      expect(component.isMapReady()).toBe(true);
    });

    it('debe seleccionar lugar desde predicción', () => {
      const { maps } = setupGoogleMapsMock();
      (component as unknown as { placesService: unknown }).placesService =
        new (maps.places.PlacesService as unknown as new (...args: unknown[]) => unknown)({});
      (component as unknown as { map: unknown }).map =
        new (maps.Map as unknown as new (...args: unknown[]) => unknown)(
          document.createElement('div'),
        );
      (component as unknown as { marker: unknown }).marker =
        new (maps.Marker as unknown as new () => unknown)();
      component.onSelectPlace({ place_id: 'p1', description: 'Caracas' });
      expect(component.selectedLocation()).toBeTruthy();
    });

    it('debe marcar mapa no listo si falta contenedor', () => {
      (component as unknown as { mapContainer: () => null }).mapContainer = () => null;
      (component as unknown as { initMap: () => void }).initMap();
      expect(component.isMapReady()).toBe(false);
    });
  });

  describe('geolocalización', () => {
    it('debe reportar error si geolocation no está soportada', () => {
      const original = navigator.geolocation;
      Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true });
      component.useCurrentLocation();
      expect(component.geolocationError()).toBe('locationModal.geolocationNotSupported');
      Object.defineProperty(navigator, 'geolocation', { value: original, configurable: true });
    });

    it('debe usar ubicación actual del navegador', () => {
      const getCurrentPosition = jest.fn((success: PositionCallback) => {
        success({ coords: { latitude: 10.5, longitude: -66.9 } } as GeolocationPosition);
      });
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition },
        configurable: true,
      });
      component.useCurrentLocation();
      expect(getCurrentPosition).toHaveBeenCalled();
    });

    it('debe reportar permiso denegado', () => {
      const getCurrentPosition = jest.fn(
        (_success: PositionCallback, error: PositionErrorCallback) => {
          error({ code: 1 } as GeolocationPositionError);
        },
      );
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition },
        configurable: true,
      });
      component.useCurrentLocation();
      expect(component.geolocationError()).toBe('locationModal.permissionDenied');
    });

    it('debe reportar posición no disponible', () => {
      const getCurrentPosition = jest.fn(
        (_success: PositionCallback, error: PositionErrorCallback) => {
          error({ code: 2 } as GeolocationPositionError);
        },
      );
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition },
        configurable: true,
      });
      component.useCurrentLocation();
      expect(component.geolocationError()).toBe('locationModal.positionUnavailable');
    });

    it('debe reportar error genérico de geolocalización', () => {
      const getCurrentPosition = jest.fn(
        (_success: PositionCallback, error: PositionErrorCallback) => {
          error({ code: 99 } as GeolocationPositionError);
        },
      );
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition },
        configurable: true,
      });
      component.useCurrentLocation();
      expect(component.geolocationError()).toBe('locationModal.geolocationError');
    });
  });

  describe('acciones del modal', () => {
    it('debe cerrar con null al cancelar', () => {
      component.cancel();
      expect(dialogRef.close).toHaveBeenCalledWith(null);
    });

    it('no debe confirmar sin ubicación seleccionada', () => {
      component.locationName.set('Oficina');
      component.confirm();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('debe crear ubicación al confirmar', () => {
      component.locationName.set('Sede');
      component.selectedLocation.set({
        lat: 10.5,
        lng: -66.9,
        address: 'Caracas',
        formattedAddress: 'Caracas, VE',
      });
      component.confirm();
      expect(locationsService.createLocation).toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('debe manejar error al crear ubicación', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      locationsService.createLocation.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      component.locationName.set('Sede');
      component.selectedLocation.set({
        lat: 10.5,
        lng: -66.9,
        address: 'Caracas',
      });
      component.confirm();
      expect(component.attempt).toBe(false);
    });

    it('no debe confirmar con nombre demasiado largo', () => {
      component.locationName.set('a'.repeat(30));
      component.selectedLocation.set({
        lat: 10.5,
        lng: -66.9,
        address: 'Caracas',
      });
      component.confirm();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });
});

describe('AddLocationModal modo edición', () => {
  let component: AddLocationModal;
  let fixture: ComponentFixture<AddLocationModal>;
  let dialogRef: { close: jest.Mock };
  let locationsService: { updateLocation: jest.Mock };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    locationsService = { updateLocation: jest.fn(() => of({ id: 5 })) };

    await TestBed.configureTestingModule({
      imports: [AddLocationModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: {
              location: {
                id: 5,
                name: 'Existente',
                lat: 10.48,
                lng: -66.9,
                address: 'Calle 1',
                formattedAddress: 'Calle 1, Caracas',
                addressComponents: '',
                idCreationBusiness: 1,
                status: StatusEnum.ACTIVE,
              },
            },
          },
        },
        {
          provide: LocationsPrivateService,
          useValue: {
            createLocation: jest.fn(),
            updateLocation: locationsService.updateLocation,
          },
        },
      ],
    })
      .overrideComponent(AddLocationModal, {
        set: { template: '<div #mapContainer></div>' },
      })
      .compileComponents();

    setupGoogleMapsMock();
    fixture = TestBed.createComponent(AddLocationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as unknown as { google?: unknown }).google;
  });

  it('debe precargar nombre en modo edición', () => {
    expect(component.isEditMode).toBe(true);
    component.onNameInput('Existente');
    expect(component.locationName()).toBe('Existente');
  });

  it('debe actualizar ubicación existente', () => {
    component.locationName.set('Renombrada');
    component.selectedLocation.set({
      lat: 10.48,
      lng: -66.9,
      address: 'Calle 1',
    });
    component.confirm();
    expect(locationsService.updateLocation).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 5 });
  });

  it('debe manejar error al actualizar ubicación', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    locationsService.updateLocation.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.locationName.set('Renombrada');
    component.selectedLocation.set({
      lat: 10.48,
      lng: -66.9,
      address: 'Calle 1',
    });
    component.confirm();
    expect(component.attempt).toBe(false);
  });
});

describe('AddLocationModal con initialLocation', () => {
  it('debe precargar ubicación inicial desde config', async () => {
    setupGoogleMapsMock();
    await TestBed.configureTestingModule({
      imports: [AddLocationModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: {
              initialLocation: {
                lat: 10.5,
                lng: -66.9,
                address: 'Centro',
                formattedAddress: 'Centro, Caracas',
              },
            },
          },
        },
        {
          provide: LocationsPrivateService,
          useValue: {
            createLocation: jest.fn(() => of({ id: 1 })),
            updateLocation: jest.fn(),
          },
        },
      ],
    })
      .overrideComponent(AddLocationModal, {
        set: { template: '<div #mapContainer></div>' },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(AddLocationModal);
    const component = fixture.componentInstance;
    const container = document.createElement('div');
    (component as unknown as { mapContainer: () => { nativeElement: HTMLElement } }).mapContainer =
      () => ({ nativeElement: container }) as ElementRef<HTMLElement>;
    (component as unknown as { initMap: () => void }).initMap();
    expect(component.selectedLocation()?.lat).toBe(10.5);
  });
});
