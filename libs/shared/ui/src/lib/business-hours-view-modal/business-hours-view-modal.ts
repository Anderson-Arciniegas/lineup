import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BusinessHourSchema, WeekDayEnum } from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

interface BusinessHoursViewModalData {
  businessName?: string;
  businessHours?: BusinessHourSchema[];
}

/** Solo lectura: muestra horarios agrupados por día de la semana para visitantes. */
@Component({
  selector: 'lib-business-hours-view-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './business-hours-view-modal.html',
  styleUrl: './business-hours-view-modal.scss',
})
export class BusinessHoursViewModal {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly translate = inject(TranslateService);

  readonly data = (this.config.data ?? {}) as BusinessHoursViewModalData;
  readonly businessName = this.data.businessName;

  readonly orderedWeekDays: WeekDayEnum[] = [
    WeekDayEnum.MONDAY,
    WeekDayEnum.TUESDAY,
    WeekDayEnum.WEDNESDAY,
    WeekDayEnum.THURSDAY,
    WeekDayEnum.FRIDAY,
    WeekDayEnum.SATURDAY,
    WeekDayEnum.SUNDAY,
  ];

  readonly businessHours: BusinessHourSchema[] = [...(this.data.businessHours ?? [])];

  close(): void {
    this.ref.close(null);
  }

  weekDayLabel(day: WeekDayEnum): string {
    return this.translate.instant(`general.weekDays.${day.toLowerCase()}`);
  }

  hoursByDay(day: WeekDayEnum): BusinessHourSchema[] {
    return this.businessHours
      .filter((h) => h.dayOfWeek === day)
      .sort((a, b) => (a.slotOrder ?? 0) - (b.slotOrder ?? 0));
  }

  formatMinutesTo12h(totalMinutes: number): string {
    const minutes = Math.max(0, Math.floor(totalMinutes));
    const hh24 = Math.floor(minutes / 60) % 24;
    const mm = minutes % 60;
    const suffix = hh24 >= 12 ? 'pm' : 'am';
    const hh12 = hh24 % 12 === 0 ? 12 : hh24 % 12;
    return `${hh12}${mm === 0 ? '' : `:${mm.toString().padStart(2, '0')}`} ${suffix}`;
  }
}

