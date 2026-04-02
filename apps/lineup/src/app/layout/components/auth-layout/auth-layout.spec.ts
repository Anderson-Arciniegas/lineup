import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { AuthLayout } from './auth-layout';

describe('AuthLayout', () => {
  let component: AuthLayout;
  let fixture: ComponentFixture<AuthLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayout, RouterModule.forRoot([]), TranslateModule.forRoot()],
      providers: [TranslateService, TranslateStore],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
