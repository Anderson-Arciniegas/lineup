import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingPublicService } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { RateModal } from './rate-modal';

describe('RateModal', () => {
  let component: RateModal;
  let fixture: ComponentFixture<RateModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateModal, TranslateModule.forRoot()],
      providers: [
        TranslateService,
        TranslateStore,
        MessageService,
        {
          provide: DynamicDialogRef,
          useValue: { close: jest.fn() },
        },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { idProduct: 1 } },
        },
        {
          provide: RatingPublicService,
          useValue: {
            rateProduct: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RateModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
