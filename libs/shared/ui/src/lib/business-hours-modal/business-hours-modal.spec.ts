import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  BusinessHourSchema,
  BusinessPrivateService,
  WeekDayEnum,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { BusinessHoursModal } from './business-hours-modal';

describe('BusinessHoursModal', () => {
  let component: BusinessHoursModal;
  let fixture: ComponentFixture<BusinessHoursModal>;
  let dialogRef: { close: jest.Mock };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [BusinessHoursModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: dialogRef },
        { provide: DynamicDialogConfig, useValue: { data: {} } },
        {
          provide: BusinessPrivateService,
          useValue: {
            createBusinessHours: jest.fn(() => of([])),
            updateBusinessHour: jest.fn(() => of({})),
            removeBusinessHour: jest.fn(() => of(true)),
          },
        },
      ],
    })
      .overrideComponent(BusinessHoursModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(BusinessHoursModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('selección de días', () => {
    it('debe agregar un día al activarlo', () => {
      component.toggleDay(WeekDayEnum.MONDAY, true);
      expect(component.isDaySelected(WeekDayEnum.MONDAY)).toBe(true);
    });

    it('debe quitar un día al desactivarlo', () => {
      component.selectedDays.set([WeekDayEnum.MONDAY, WeekDayEnum.TUESDAY]);
      component.toggleDay(WeekDayEnum.MONDAY, false);
      expect(component.isDaySelected(WeekDayEnum.MONDAY)).toBe(false);
    });

    it('debe alternar día con toggleDayByClick', () => {
      component.toggleDayByClick(WeekDayEnum.FRIDAY);
      expect(component.isDaySelected(WeekDayEnum.FRIDAY)).toBe(true);
      component.toggleDayByClick(WeekDayEnum.FRIDAY);
      expect(component.isDaySelected(WeekDayEnum.FRIDAY)).toBe(false);
    });
  });

  describe('validación y envío', () => {
    it('debe reportar error si no hay días seleccionados', () => {
      component.selectedDays.set([]);
      expect(component.daysError()).toBe('businessHoursModal.errors.selectDays');
      expect(component.canSubmit()).toBe(false);
    });

    it('debe permitir envío con días y horario válidos', () => {
      component.selectedDays.set([WeekDayEnum.MONDAY]);
      component.opensAt.set('09:00');
      component.closesAt.set('17:00');
      expect(component.timeError()).toBeNull();
      expect(component.canSubmit()).toBe(true);
    });

    it('debe cerrar con null al cancelar', () => {
      component.cancel();
      expect(dialogRef.close).toHaveBeenCalledWith(null);
    });
  });

  describe('etiquetas de días', () => {
    it('debe devolver abreviatura en español por defecto', () => {
      expect(component.weekDayShortLabel(WeekDayEnum.MONDAY)).toBe('LU');
    });

    it('debe devolver clave i18n para el día completo', () => {
      expect(component.weekDayLabel(WeekDayEnum.WEDNESDAY)).toBe(
        'general.weekDays.wednesday',
      );
    });
  });
});

describe('BusinessHoursModal (modo edición)', () => {
  let component: BusinessHoursModal;
  let fixture: ComponentFixture<BusinessHoursModal>;
  let businessService: {
    updateBusinessHour: jest.Mock;
    removeBusinessHour: jest.Mock;
  };
  let dialogRef: { close: jest.Mock };

  const businessHour: BusinessHourSchema = {
    id: 10,
    idBusiness: 1,
    dayOfWeek: WeekDayEnum.TUESDAY,
    opensAtMinute: 540,
    closesAtMinute: 1020,
    slotOrder: 1,
  };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    businessService = {
      updateBusinessHour: jest.fn(() => of(businessHour)),
      removeBusinessHour: jest.fn(() => of(true)),
    };

    await TestBed.configureTestingModule({
      imports: [BusinessHoursModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { businessHour } },
        },
        { provide: BusinessPrivateService, useValue: businessService },
      ],
    })
      .overrideComponent(BusinessHoursModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(BusinessHoursModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('no debe permitir cambiar días en modo edición', () => {
    const initialDays = component.selectedDays();
    component.toggleDay(WeekDayEnum.FRIDAY, true);
    expect(component.selectedDays()).toEqual(initialDays);
  });

  it('debe enviar actualización en modo edición', () => {
    component.submit();
    expect(businessService.updateBusinessHour).toHaveBeenCalled();
  });

  it('debe eliminar horario en modo edición', () => {
    component.remove();
    expect(businessService.removeBusinessHour).toHaveBeenCalledWith(10);
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('debe manejar error al eliminar horario', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    businessService.removeBusinessHour.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.remove();
    expect(component.attempt()).toBe(false);
  });

  it('debe manejar error al actualizar horario', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    businessService.updateBusinessHour.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.submit();
    expect(component.attempt()).toBe(false);
  });
});

describe('BusinessHoursModal envío y pickers', () => {
  let component: BusinessHoursModal;
  let fixture: ComponentFixture<BusinessHoursModal>;
  let dialogRef: { close: jest.Mock };
  let businessService: {
    createBusinessHours: jest.Mock;
    removeBusinessHour: jest.Mock;
  };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    businessService = {
      createBusinessHours: jest.fn(() =>
        of([
          {
            id: 99,
            idBusiness: 1,
            dayOfWeek: WeekDayEnum.MONDAY,
            opensAtMinute: 540,
            closesAtMinute: 1020,
            slotOrder: 1,
          },
        ]),
      ),
      removeBusinessHour: jest.fn(() => of(true)),
    };

    await TestBed.configureTestingModule({
      imports: [BusinessHoursModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: DynamicDialogRef, useValue: dialogRef },
        { provide: DynamicDialogConfig, useValue: { data: { businessHours: [] } } },
        { provide: BusinessPrivateService, useValue: businessService },
      ],
    })
      .overrideComponent(BusinessHoursModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(BusinessHoursModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear horarios y cerrar con lista fusionada', () => {
    component.selectedDays.set([WeekDayEnum.MONDAY]);
    component.submit();
    expect(businessService.createBusinessHours).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('debe reportar error si inicio y fin son iguales', () => {
    component.selectedDays.set([WeekDayEnum.MONDAY]);
    component.opensAt.set('09:00');
    component.closesAt.set('09:00');
    expect(component.timeError()).toBe(
      'businessHoursModal.errors.startMustBeDifferentFromEnd',
    );
  });

  it('debe limpiar opensAt si el picker es null', () => {
    component.onOpensAtPickerChange(null);
    expect(component.opensAt()).toBe('');
  });

  it('debe actualizar opensAt desde picker', () => {
    const date = new Date(2000, 0, 1, 10, 30);
    component.onOpensAtPickerChange(date);
    expect(component.opensAt()).toBe('10:30');
  });

  it('debe limpiar closesAt si el picker es null', () => {
    component.onClosesAtPickerChange(null);
    expect(component.closesAt()).toBe('');
  });

  it('debe reportar error con hora inválida', () => {
    component.opensAt.set('');
    component.closesAt.set('09:00');
    expect(component.timeError()).toBe('businessHoursModal.errors.invalidTime');
  });

  it('debe reportar error si no hay días seleccionados', () => {
    component.selectedDays.set([]);
    expect(component.daysError()).toBe('businessHoursModal.errors.selectDays');
  });

  it('no debe enviar sin días seleccionados', () => {
    component.selectedDays.set([]);
    component.submit();
    expect(businessService.createBusinessHours).not.toHaveBeenCalled();
  });

  it('debe manejar error al crear horarios', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    businessService.createBusinessHours.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.selectedDays.set([WeekDayEnum.MONDAY]);
    component.submit();
    expect(component.attempt()).toBe(false);
  });
});
