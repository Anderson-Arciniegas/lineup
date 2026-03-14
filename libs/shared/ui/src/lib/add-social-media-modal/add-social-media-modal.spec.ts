import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddSocialMediaModal } from './add-social-media-modal';

describe('AddSocialMediaModal', () => {
  let component: AddSocialMediaModal;
  let fixture: ComponentFixture<AddSocialMediaModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSocialMediaModal, TranslateModule.forRoot()],
      providers: [
        TranslateService,
        TranslateStore,
        { provide: Apollo, useValue: {} },
        { provide: DynamicDialogRef, useValue: { close: (): void => { /* mock */ } } },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: {
              socialMedia: { id: 1, code: 'facebook', name: 'Facebook' },
              businessSocialNetwork: null,
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSocialMediaModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
