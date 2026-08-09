import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessPrivateService, WeekDayEnum } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, of, throwError } from 'rxjs';
import { BusinessHoursPage } from './business-hours-page';

describe('BusinessHoursPage', () => {
  let component: BusinessHoursPage;
  let fixture: ComponentFixture<BusinessHoursPage>;
  let dialogOpen: jest.Mock;
  let onClose$: Subject<unknown>;
  let findAllMyBusinessHours: jest.Mock;

  const hour = {
    id: 1,
    dayOfWeek: WeekDayEnum.MONDAY,
    slotOrder: 1,
    openMinutes: 540,
    closeMinutes: 1020,
  };

  beforeEach(async () => {
    onClose$ = new Subject<unknown>();
    dialogOpen = jest.fn(() => ({ onClose: onClose$.asObservable() }));
    findAllMyBusinessHours = jest.fn(() => of([hour]));

    await TestBed.configureTestingModule({
      imports: [BusinessHoursPage, TranslateModule.forRoot()],
      providers: [
        { provide: DialogService, useValue: { open: dialogOpen } },
        {
          provide: BusinessPrivateService,
          useValue: { findAllMyBusinessHours },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessHoursPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear y cargar horarios', () => {
    expect(component).toBeTruthy();
    expect(findAllMyBusinessHours).toHaveBeenCalled();
    expect(component.businessHours.length).toBe(1);
  });

  it('hoursByDay filtra y ordena por slotOrder', () => {
    component.businessHours = [
      { ...hour, id: 2, slotOrder: 2 },
      hour as any,
    ];
    const monday = component.hoursByDay(WeekDayEnum.MONDAY);
    expect(monday.length).toBe(2);
    expect(monday[0].slotOrder).toBe(1);
  });

  it('weekDayLabel devuelve clave i18n', () => {
    expect(component.weekDayLabel(WeekDayEnum.FRIDAY)).toBe(
      'general.weekDays.friday',
    );
  });

  it('minutesToTime formatea HH:mm', () => {
    expect(component.minutesToTime(540)).toBe('09:00');
    expect(component.minutesToTime(-10)).toBe('00:00');
  });

  describe('openBusinessHoursModal', () => {
    it('debe reemplazar array completo si la respuesta es array', () => {
      const updated = [{ ...hour, id: 99 }];
      component.openBusinessHoursModal();
      onClose$.next(updated);
      expect(component.businessHours[0].id).toBe(99);
    });

    it('debe actualizar horario existente', () => {
      component.openBusinessHoursModal(hour as any);
      onClose$.next({ ...hour, openMinutes: 600 });
      expect(component.businessHours[0].openMinutes).toBe(600);
    });

    it('debe añadir horario nuevo', () => {
      component.businessHours = [];
      component.openBusinessHoursModal();
      onClose$.next(hour);
      expect(component.businessHours.length).toBe(1);
    });
  });

  describe('openBusinessHoursModalForDay', () => {
    it('debe preseleccionar el día indicado', () => {
      component.openBusinessHoursModalForDay(WeekDayEnum.TUESDAY);
      expect(dialogOpen).toHaveBeenCalled();
      onClose$.next([hour]);
      expect(component.businessHours.length).toBe(1);
    });
  });
});

describe('BusinessHoursPage errores', () => {
  it('debe manejar error al cargar horarios', async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessHoursPage, TranslateModule.forRoot()],
      providers: [
        { provide: DialogService, useValue: { open: jest.fn() } },
        {
          provide: BusinessPrivateService,
          useValue: {
            findAllMyBusinessHours: () =>
              throwError(() => new Error('fail')),
          },
        },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(BusinessHoursPage);
    fix.detectChanges();
    expect(fix.componentInstance.attempt).toBe(false);
  });
});
