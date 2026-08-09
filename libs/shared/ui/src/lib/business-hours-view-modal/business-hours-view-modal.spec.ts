import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BusinessHourSchema, WeekDayEnum } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BusinessHoursViewModal } from './business-hours-view-modal';

describe('BusinessHoursViewModal', () => {
  let component: BusinessHoursViewModal;
  let fixture: ComponentFixture<BusinessHoursViewModal>;
  let dialogRef: { close: jest.Mock };

  const businessHours: BusinessHourSchema[] = [
    {
      id: 2,
      idBusiness: 1,
      dayOfWeek: WeekDayEnum.MONDAY,
      opensAtMinute: 600,
      closesAtMinute: 720,
      slotOrder: 2,
    },
    {
      id: 1,
      idBusiness: 1,
      dayOfWeek: WeekDayEnum.MONDAY,
      opensAtMinute: 480,
      closesAtMinute: 540,
      slotOrder: 1,
    },
    {
      id: 3,
      idBusiness: 1,
      dayOfWeek: WeekDayEnum.FRIDAY,
      opensAtMinute: 540,
      closesAtMinute: 1020,
      slotOrder: 1,
    },
  ];

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [BusinessHoursViewModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: { businessName: 'Mi negocio', businessHours },
          },
        },
      ],
    })
      .overrideComponent(BusinessHoursViewModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(BusinessHoursViewModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe exponer el nombre del negocio desde la config', () => {
    expect(component.businessName).toBe('Mi negocio');
  });

  describe('hoursByDay', () => {
    it('debe filtrar horarios por día', () => {
      const monday = component.hoursByDay(WeekDayEnum.MONDAY);
      expect(monday).toHaveLength(2);
      expect(monday.every((h) => h.dayOfWeek === WeekDayEnum.MONDAY)).toBe(true);
    });

    it('debe ordenar por slotOrder ascendente', () => {
      const monday = component.hoursByDay(WeekDayEnum.MONDAY);
      expect(monday[0].slotOrder).toBe(1);
      expect(monday[1].slotOrder).toBe(2);
    });

    it('debe devolver arreglo vacío si no hay horarios para el día', () => {
      expect(component.hoursByDay(WeekDayEnum.SUNDAY)).toEqual([]);
    });
  });

  describe('formatMinutesTo12h', () => {
    it('debe formatear medianoche como 12 am', () => {
      expect(component.formatMinutesTo12h(0)).toBe('12 am');
    });

    it('debe formatear horario con minutos en formato 12h', () => {
      expect(component.formatMinutesTo12h(13 * 60 + 30)).toBe('1:30 pm');
    });
  });

  it('debe cerrar el diálogo al invocar close', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalledWith(null);
  });
});
