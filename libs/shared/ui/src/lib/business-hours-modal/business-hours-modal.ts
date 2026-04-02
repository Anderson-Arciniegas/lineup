import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BusinessHourSchema,
  BusinessPrivateService,
  CreateBusinessHoursInput,
  UpdateBusinessHourInput,
  WeekDayEnum,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from '../button/button';

type BusinessHoursModalCloseValue = BusinessHourSchema | BusinessHourSchema[] | null;

interface BusinessHoursModalData {
  businessHour?: BusinessHourSchema;
  businessHours?: BusinessHourSchema[];
  preselectedDays?: WeekDayEnum[];
}

@Component({
  selector: 'lib-business-hours-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, DatePickerModule, Button],
  templateUrl: './business-hours-modal.html',
  styleUrl: './business-hours-modal.scss',
})
export class BusinessHoursModal {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly translate = inject(TranslateService);
  private readonly businessService = inject(BusinessPrivateService);

  readonly data = (this.config.data ?? {}) as BusinessHoursModalData;
  readonly businessHourToEdit = this.data.businessHour;
  readonly isEditMode = !!this.businessHourToEdit;

  readonly orderedWeekDays: WeekDayEnum[] = [
    WeekDayEnum.MONDAY,
    WeekDayEnum.TUESDAY,
    WeekDayEnum.WEDNESDAY,
    WeekDayEnum.THURSDAY,
    WeekDayEnum.FRIDAY,
    WeekDayEnum.SATURDAY,
    WeekDayEnum.SUNDAY,
  ];

  readonly selectedDays = signal<WeekDayEnum[]>(
    this.businessHourToEdit?.dayOfWeek
      ? [this.businessHourToEdit.dayOfWeek]
      : (this.data.preselectedDays ?? []),
  );

  readonly opensAt = signal(this.minutesToTime(this.businessHourToEdit?.opensAtMinute ?? 9 * 60));
  readonly closesAt = signal(
    this.minutesToTime(this.businessHourToEdit?.closesAtMinute ?? 17 * 60),
  );

  readonly opensAtPicker = signal<Date>(this.time24ToDate(this.opensAt()) ?? new Date());
  readonly closesAtPicker = signal<Date>(this.time24ToDate(this.closesAt()) ?? new Date());

  readonly slotOrder = signal<number>(this.businessHourToEdit?.slotOrder ?? 1);
  readonly attempt = signal(false);

  readonly opensAtMinutes = computed(() => this.timeToMinutes(this.opensAt()));
  readonly closesAtMinutes = computed(() => this.timeToMinutes(this.closesAt()));
  readonly durationMinutes = computed(() => {
    const start = this.opensAtMinutes();
    const end = this.closesAtMinutes();
    if (start == null || end == null) return null;
    return (end - start + 24 * 60) % (24 * 60);
  });

  readonly daysError = computed(() =>
    this.selectedDays().length === 0 ? 'businessHoursModal.errors.selectDays' : null,
  );

  readonly timeError = computed(() => {
    const duration = this.durationMinutes();
    if (duration == null) return 'businessHoursModal.errors.invalidTime';
    if (duration === 0) return 'businessHoursModal.errors.startMustBeDifferentFromEnd';
    return null;
  });

  readonly canSubmit = computed(
    () =>
      !this.attempt() &&
      this.daysError() == null &&
      this.timeError() == null &&
      this.opensAtMinutes() != null &&
      this.closesAtMinutes() != null,
  );

  weekDayLabel(day: WeekDayEnum): string {
    return `general.weekDays.${day.toLowerCase()}`;
  }

  weekDayShortLabel(day: WeekDayEnum): string {
    const lang = (this.translate.currentLang ?? 'es').toLowerCase();
    const isEs = lang.startsWith('es');
    const mapEs: Record<WeekDayEnum, string> = {
      [WeekDayEnum.MONDAY]: 'LU',
      [WeekDayEnum.TUESDAY]: 'MA',
      [WeekDayEnum.WEDNESDAY]: 'MI',
      [WeekDayEnum.THURSDAY]: 'JU',
      [WeekDayEnum.FRIDAY]: 'VI',
      [WeekDayEnum.SATURDAY]: 'SA',
      [WeekDayEnum.SUNDAY]: 'DO',
    };
    const mapEn: Record<WeekDayEnum, string> = {
      [WeekDayEnum.MONDAY]: 'MO',
      [WeekDayEnum.TUESDAY]: 'TU',
      [WeekDayEnum.WEDNESDAY]: 'WE',
      [WeekDayEnum.THURSDAY]: 'TH',
      [WeekDayEnum.FRIDAY]: 'FR',
      [WeekDayEnum.SATURDAY]: 'SA',
      [WeekDayEnum.SUNDAY]: 'SU',
    };
    return isEs ? mapEs[day] : mapEn[day];
  }

  toggleDay(day: WeekDayEnum, checked: boolean): void {
    if (this.isEditMode) return;
    const current = this.selectedDays();
    this.selectedDays.set(
      checked ? [...current, day] : current.filter((d) => d !== day),
    );
  }

  toggleDayByClick(day: WeekDayEnum): void {
    if (this.isEditMode) return;
    const selected = this.isDaySelected(day);
    this.toggleDay(day, !selected);
  }

  isDaySelected(day: WeekDayEnum): boolean {
    return this.selectedDays().includes(day);
  }

  cancel(): void {
    this.ref.close(null);
  }

  onOpensAtPickerChange(value: Date | null): void {
    if (!value) {
      this.opensAt.set('');
      return;
    }
    this.opensAtPicker.set(value);
    this.opensAt.set(this.dateToTime24(value));
  }

  onClosesAtPickerChange(value: Date | null): void {
    if (!value) {
      this.closesAt.set('');
      return;
    }
    this.closesAtPicker.set(value);
    this.closesAt.set(this.dateToTime24(value));
  }

  remove(): void {
    if (!this.isEditMode || !this.businessHourToEdit) return;
    if (this.attempt()) return;
    this.attempt.set(true);

    const businessHourId = this.businessHourToEdit.id;
    this.businessService.removeBusinessHour(this.businessHourToEdit.id).subscribe({
      next: (removed) => {
        if (!removed) {
          this.attempt.set(false);
          return;
        }
        const existing = this.data.businessHours ?? [];
        const updated = existing.filter((h) => h.id !== businessHourId);
        this.ref.close(updated as BusinessHoursModalCloseValue);
        this.attempt.set(false);
      },
      error: (error) => {
        console.error(error);
        this.attempt.set(false);
      },
    });
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.attempt.set(true);

    const opensAtMinute = this.opensAtMinutes();
    const closesAtMinute = this.closesAtMinutes();
    if (opensAtMinute == null || closesAtMinute == null) {
      this.attempt.set(false);
      return;
    }

    if (this.isEditMode && this.businessHourToEdit) {
      const payload: UpdateBusinessHourInput = {
        id: this.businessHourToEdit.id,
        opensAtMinute,
        closesAtMinute,
        slotOrder: this.slotOrder(),
      };

      this.businessService.updateBusinessHour(payload).subscribe({
        next: (updated) => {
          this.ref.close(updated as BusinessHoursModalCloseValue);
          this.attempt.set(false);
        },
        error: (error) => {
          console.error(error);
          this.attempt.set(false);
        },
      });
      return;
    }

    const slots = this.selectedDays().map((dayOfWeek) => ({
      dayOfWeek,
      opensAtMinute,
      closesAtMinute,
      slotOrder: this.slotOrder(),
    }));

    const payload: CreateBusinessHoursInput = { slots };
    this.businessService.createBusinessHours(payload).subscribe({
      next: (created) => {
        const existing = this.data.businessHours ?? [];
        const merged = this.mergeBusinessHours(existing, created);
        this.ref.close(merged as BusinessHoursModalCloseValue);
        this.attempt.set(false);
      },
      error: (error) => {
        console.error(error);
        this.attempt.set(false);
      },
    });
  }

  private mergeBusinessHours(
    existing: BusinessHourSchema[],
    created: BusinessHourSchema[],
  ): BusinessHourSchema[] {
    const mapById = new Map<number, BusinessHourSchema>();
    for (const item of existing) mapById.set(item.id, item);
    for (const item of created) mapById.set(item.id, item);
    return [...mapById.values()];
  }

  private minutesToTime(totalMinutes: number): string {
    const minutes = Math.max(0, Math.floor(totalMinutes));
    const hh = Math.floor(minutes / 60) % 24;
    const mm = minutes % 60;
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  }

  private timeToMinutes(value: string): number | null {
    const trimmed = (value ?? '').trim();
    const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
    if (!match) return null;
    const hh = Number(match[1]);
    const mm = Number(match[2]);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
    return hh * 60 + mm;
  }

  private time24ToDate(value24: string): Date | null {
    const minutes = this.timeToMinutes(value24);
    if (minutes == null) return null;
    const date = new Date(2000, 0, 1, 0, 0, 0, 0);
    date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return date;
  }

  private dateToTime24(date: Date): string {
    const hh = date.getHours();
    const mm = date.getMinutes();
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  }

  get submitLabel(): string {
    return this.isEditMode
      ? this.translate.instant('general.save')
      : this.translate.instant('general.save');
  }
}

