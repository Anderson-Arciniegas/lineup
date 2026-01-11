import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { SocialMediasPage } from './social-medias-page';

describe('SocialMediasPage', () => {
  let component: SocialMediasPage;
  let fixture: ComponentFixture<SocialMediasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialMediasPage, TranslateModule.forRoot()],
      providers: [
        DialogService,
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialMediasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
