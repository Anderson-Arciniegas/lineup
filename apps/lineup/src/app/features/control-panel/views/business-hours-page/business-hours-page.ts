import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BusinessHourSchema, BusinessPrivateService, WeekDayEnum } from '@lineup/core';
import { BusinessHoursModal, Button } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-business-hours-page',
  imports: [CommonModule, TranslateModule, Button, ProgressSpinner],
  templateUrl: './business-hours-page.html',
  styleUrl: './business-hours-page.scss',
})
export class BusinessHoursPage implements OnInit {
  businessHours: BusinessHourSchema[] = [];
  attempt = false;
  ref: DynamicDialogRef | undefined;

  readonly orderedWeekDays: WeekDayEnum[] = [
    WeekDayEnum.MONDAY,
    WeekDayEnum.TUESDAY,
    WeekDayEnum.WEDNESDAY,
    WeekDayEnum.THURSDAY,
    WeekDayEnum.FRIDAY,
    WeekDayEnum.SATURDAY,
    WeekDayEnum.SUNDAY,
  ];

  private readonly dialogService = inject(DialogService);
  private readonly translate = inject(TranslateService);
  private readonly businessService = inject(BusinessPrivateService);
  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.loadBusinessHours();
  }

  loadBusinessHours(): void {
    if (this.attempt) return;
    this.attempt = true;
    this.subscriptions.add(
      this.businessService.findAllMyBusinessHours().subscribe({
        next: (response) => {
          this.businessHours = [...response];
          this.attempt = false;
        },
        error: (error) => {
          console.error(error);
          this.attempt = false;
        },
      }),
    );
  }

  hoursByDay(day: WeekDayEnum): BusinessHourSchema[] {
    return this.businessHours
      .filter((h) => h.dayOfWeek === day)
      .sort((a, b) => (a.slotOrder ?? 0) - (b.slotOrder ?? 0));
  }

  weekDayLabel(day: WeekDayEnum): string {
    return `general.weekDays.${day.toLowerCase()}`;
  }

  minutesToTime(totalMinutes: number): string {
    const minutes = Math.max(0, Math.floor(totalMinutes));
    const hh = Math.floor(minutes / 60) % 24;
    const mm = minutes % 60;
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  }

  openBusinessHoursModal(businessHour?: BusinessHourSchema): void {
    this.ref = this.dialogService.open(BusinessHoursModal, {
      header: this.translate.instant(
        businessHour ? 'general.editBusinessHours' : 'general.addBusinessHours',
      ),
      width: '620px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '520px',
        '500px': '86vw',
        '400px': '92vw',
      },
      data: {
        businessHour,
        businessHours: this.businessHours,
      },
      modal: true,
      closable: true,
    });

    this.ref.onClose.subscribe(
      (response: BusinessHourSchema[] | BusinessHourSchema | undefined) => {
        if (!response) return;
        if (Array.isArray(response)) {
          this.businessHours = [...response];
          return;
        }
        const index = this.businessHours.findIndex((h) => h.id === response.id);
        if (index !== -1) {
          this.businessHours = [
            ...this.businessHours.slice(0, index),
            response,
            ...this.businessHours.slice(index + 1),
          ];
        } else {
          this.businessHours = [...this.businessHours, response];
        }
      },
    );
  }

  openBusinessHoursModalForDay(day: WeekDayEnum): void {
    this.ref = this.dialogService.open(BusinessHoursModal, {
      header: this.translate.instant('general.addBusinessHours'),
      width: '620px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '520px',
        '500px': '86vw',
        '400px': '92vw',
      },
      data: {
        businessHours: this.businessHours,
        preselectedDays: [day],
      },
      modal: true,
      closable: true,
    });

    this.ref.onClose.subscribe(
      (response: BusinessHourSchema[] | BusinessHourSchema | undefined) => {
        if (!response) return;
        if (Array.isArray(response)) {
          this.businessHours = [...response];
          return;
        }
        const index = this.businessHours.findIndex((h) => h.id === response.id);
        if (index !== -1) {
          this.businessHours = [
            ...this.businessHours.slice(0, index),
            response,
            ...this.businessHours.slice(index + 1),
          ];
        } else {
          this.businessHours = [...this.businessHours, response];
        }
      },
    );
  }
}
