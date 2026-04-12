import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPrivateService } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { BusinessData } from './business-data';

describe('BusinessData', () => {
  let component: BusinessData;
  let fixture: ComponentFixture<BusinessData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessData, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        DialogService,
        {
          provide: MessageService,
          useValue: { add: jest.fn() },
        },
        {
          provide: CurrencyPrivateService,
          useValue: { findAllCurrencies: () => of([]) },
        },
        { provide: Apollo, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
