import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialMediasPage } from './social-medias-page';

describe('SocialMediasPage', () => {
  let component: SocialMediasPage;
  let fixture: ComponentFixture<SocialMediasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialMediasPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialMediasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
