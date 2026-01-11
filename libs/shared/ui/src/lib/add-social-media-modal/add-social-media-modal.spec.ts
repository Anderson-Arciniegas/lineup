import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSocialMediaModal);
    component = fixture.componentInstance;
    component.socialMedia = { icon: 'pi pi-facebook', name: 'Facebook' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
