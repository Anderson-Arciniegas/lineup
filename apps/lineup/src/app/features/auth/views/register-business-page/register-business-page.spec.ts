import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { RegisterBusinessPage } from './register-business-page';

describe('RegisterBusinessPage', () => {
  let component: RegisterBusinessPage;
  let fixture: ComponentFixture<RegisterBusinessPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterBusinessPage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterBusinessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
