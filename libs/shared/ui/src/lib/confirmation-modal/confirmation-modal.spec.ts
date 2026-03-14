import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationModal } from './confirmation-modal';

describe('ConfirmationModal', () => {
  let component: ConfirmationModal;
  let fixture: ComponentFixture<ConfirmationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationModal, TranslateModule.forRoot()],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: () => {} } },
        { provide: DynamicDialogConfig, useValue: { data: {} } },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
