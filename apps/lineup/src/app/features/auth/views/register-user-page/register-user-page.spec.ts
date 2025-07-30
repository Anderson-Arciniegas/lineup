import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { RegisterUserPage } from './register-user-page';

describe('RegisterUserPage', () => {
  let component: RegisterUserPage;
  let fixture: ComponentFixture<RegisterUserPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterUserPage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
