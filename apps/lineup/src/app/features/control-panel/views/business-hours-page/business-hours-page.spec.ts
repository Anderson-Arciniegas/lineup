import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessPrivateService } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { BusinessHoursPage } from './business-hours-page';

describe('BusinessHoursPage', () => {
  let component: BusinessHoursPage;
  let fixture: ComponentFixture<BusinessHoursPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessHoursPage, TranslateModule.forRoot()],
      providers: [
        DialogService,
        TranslateService,
        TranslateStore,
        {
          provide: BusinessPrivateService,
          useValue: {
            findAllMyBusinessHours: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessHoursPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
