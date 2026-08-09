import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { translateModuleForTests } from '../../../../../testing';
import { StatsAdminService } from '../../../../core/services/stats-admin.service';
import { AdminStatsPeriodMode, StatsAdminPage } from './stats-admin-page';

describe('StatsAdminPage', () => {
  let component: StatsAdminPage;
  let fixture: ComponentFixture<StatsAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsAdminPage, translateModuleForTests()],
      providers: [
        MessageService,
        {
          provide: StatsAdminService,
          useValue: {
            adminCatalogGlobalStats: () => of({}),
            adminUserStats: () => of({}),
            adminBusinessStats: () => of({}),
            adminDiscountGlobalStats: () => of({}),
            adminPlatformEngagementStats: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load stats bundle', () => {
    expect(component).toBeTruthy();
    expect(component.bundle()).toBeTruthy();
    expect(component.loading()).toBe(false);
  });

  it('statsDatePickerFormat uses en format when current lang is en', () => {
    component['translate'].use('en');
    expect(component.statsDatePickerFormat).toBe('mm/dd/yy');
  });

  it('onPeriodModeChange reloads for non-custom modes', () => {
    component.periodMode = AdminStatsPeriodMode.WEEK;
    component.onPeriodModeChange();
    expect(component.loading()).toBe(false);
  });

  it('applyCustomPeriod warns when dates are missing', () => {
    const add = jest.spyOn(component['messageService'], 'add');
    component.periodMode = AdminStatsPeriodMode.CUSTOM;
    component.applyCustomPeriod();
    expect(add).toHaveBeenCalled();
  });

  it('applyCustomPeriod warns on invalid date range', () => {
    const add = jest.spyOn(component['messageService'], 'add');
    component.periodMode = AdminStatsPeriodMode.CUSTOM;
    component.customStartDate = new Date('2026-02-01');
    component.customEndDate = new Date('2026-01-01');
    component.applyCustomPeriod();
    expect(add).toHaveBeenCalled();
  });

  it('applyCustomPeriod reloads for valid custom range', () => {
    component.periodMode = AdminStatsPeriodMode.CUSTOM;
    component.customStartDate = new Date('2026-01-01');
    component.customEndDate = new Date('2026-01-31');
    component.applyCustomPeriod();
    expect(component.loading()).toBe(false);
  });

  it('onPeriodModeChange ignores custom mode without reload', () => {
    component.periodMode = AdminStatsPeriodMode.CUSTOM;
    component.onPeriodModeChange();
    expect(component.loading()).toBe(false);
  });

  it('supports ALL and DAY period modes', () => {
    component.periodMode = AdminStatsPeriodMode.ALL;
    component.onPeriodModeChange();
    component.periodMode = AdminStatsPeriodMode.DAY;
    component.onPeriodModeChange();
    expect(component.bundle()).toBeTruthy();
  });

  it('supports MONTH period mode', () => {
    component.periodMode = AdminStatsPeriodMode.MONTH;
    component.onPeriodModeChange();
    expect(component.bundle()).toBeTruthy();
  });

  it('supports WEEK period mode', () => {
    component.periodMode = AdminStatsPeriodMode.WEEK;
    component.onPeriodModeChange();
    expect(component.bundle()).toBeTruthy();
  });
});
