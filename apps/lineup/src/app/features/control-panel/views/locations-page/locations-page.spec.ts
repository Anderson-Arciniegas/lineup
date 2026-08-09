import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AuthStore,
  LocationsPrivateService,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, of, throwError } from 'rxjs';
import { LocationsPage } from './locations-page';

describe('LocationsPage', () => {
  let component: LocationsPage;
  let fixture: ComponentFixture<LocationsPage>;
  let dialogOpen: jest.Mock;
  let onClose$: Subject<unknown>;
  let findAllMyLocations: jest.Mock;
  let removeLocation: jest.Mock;

  const location = {
    id: 1,
    address: 'Calle 1, Ciudad, País',
    name: 'Sucursal',
  };

  beforeEach(async () => {
    onClose$ = new Subject<unknown>();
    dialogOpen = jest.fn(() => ({ onClose: onClose$.asObservable() }));
    findAllMyLocations = jest.fn(() => of([location]));
    removeLocation = jest.fn(() => of(undefined));

    await TestBed.configureTestingModule({
      imports: [LocationsPage, TranslateModule.forRoot()],
      providers: [
        { provide: DialogService, useValue: { open: dialogOpen } },
        {
          provide: AuthStore,
          useValue: { business: () => ({ id: 1, name: 'Biz' }) },
        },
        {
          provide: LocationsPrivateService,
          useValue: { findAllMyLocations, removeLocation },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear y cargar ubicaciones', () => {
    expect(component).toBeTruthy();
    expect(findAllMyLocations).toHaveBeenCalled();
    expect(component.locations.length).toBe(1);
  });

  it('getAddress debe acortar a las dos primeras partes', () => {
    expect(component.getAddress('A, B, C, D')).toBe('A,  B');
  });

  describe('openLocationModal', () => {
    it('debe abrir modal de edición si el usuario elige editar', () => {
      component.openLocationModal(location as any);
      onClose$.next({ edit: true });
      expect(dialogOpen).toHaveBeenCalledTimes(2);
    });

    it('debe abrir confirmación de borrado si el usuario elige eliminar', () => {
      component.openLocationModal(location as any);
      onClose$.next({ delete: true });
      expect(dialogOpen).toHaveBeenCalledTimes(2);
    });
  });

  describe('addLocationModal', () => {
    it('debe añadir nueva ubicación al cerrar con respuesta', () => {
      const newLoc = { id: 2, address: 'Nueva', name: 'N' };
      component.addLocationModal();
      onClose$.next(newLoc);
      expect(component.locations.some((l) => l.id === 2)).toBe(true);
    });

    it('debe actualizar ubicación existente', () => {
      const updated = { ...location, name: 'Actualizada' };
      component.addLocationModal(location as any);
      onClose$.next(updated);
      expect(component.locations[0].name).toBe('Actualizada');
    });
  });

  describe('deleteLocation', () => {
    it('debe eliminar tras confirmación', () => {
      component.deleteLocation(location as any);
      onClose$.next(true);
      expect(removeLocation).toHaveBeenCalledWith(1);
      expect(component.locations.length).toBe(0);
    });

    it('no debe eliminar si se cancela', () => {
      component.deleteLocation(location as any);
      onClose$.next(false);
      expect(removeLocation).not.toHaveBeenCalled();
    });
  });
});

describe('LocationsPage errores', () => {
  it('debe manejar error al cargar ubicaciones', async () => {
    await TestBed.configureTestingModule({
      imports: [LocationsPage, TranslateModule.forRoot()],
      providers: [
        { provide: DialogService, useValue: { open: jest.fn() } },
        { provide: AuthStore, useValue: { business: () => ({ id: 1 }) } },
        {
          provide: LocationsPrivateService,
          useValue: {
            findAllMyLocations: () => throwError(() => new Error('fail')),
            removeLocation: jest.fn(),
          },
        },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(LocationsPage);
    fix.detectChanges();
    expect(fix.componentInstance.attempt).toBe(false);
  });
});
