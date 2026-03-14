import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { SocialMediasPage } from './social-medias-page';

describe('SocialMediasPage', () => {
  let component: SocialMediasPage;
  let fixture: ComponentFixture<SocialMediasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialMediasPage, TranslateModule.forRoot()],
      providers: [
        DialogService,
        MessageService,
        TranslateService,
        TranslateStore,
        {
          provide: Apollo,
          useValue: { use: () => ({ query: () => of({ data: {} }), mutate: () => of({ data: {} }) }) },
        },
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
