import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSocialMediaModal } from './add-social-media-modal';

describe('AddSocialMediaModal', () => {
  let component: AddSocialMediaModal;
  let fixture: ComponentFixture<AddSocialMediaModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSocialMediaModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSocialMediaModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
