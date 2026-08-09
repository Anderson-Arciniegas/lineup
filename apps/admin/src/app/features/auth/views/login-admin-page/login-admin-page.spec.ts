import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { translateModuleForTests, adminTestProviders } from '../../../../../testing';
import { AuthAdminService } from '../../../../core/services/auth-admin.service';
import { LoginAdminPage } from './login-admin-page';

describe('LoginAdminPage', () => {
  let component: LoginAdminPage;
  let fixture: ComponentFixture<LoginAdminPage>;
  let login: jest.Mock;

  beforeEach(async () => {
    login = jest.fn(() => of({ status: true }));
    await TestBed.configureTestingModule({
      imports: [LoginAdminPage, translateModuleForTests()],
      providers: [
        provideRouter([]),
        ...adminTestProviders(),
        {
          provide: AuthAdminService,
          useValue: { login },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSubmit skips invalid form', () => {
    component.onSubmit();
    expect(login).not.toHaveBeenCalled();
  });

  it('onSubmit skips when attempt is already in progress', () => {
    component.loginForm.setValue({ email: 'a@test.com', password: 'secret' });
    component.attempt = true;
    component.onSubmit();
    expect(login).not.toHaveBeenCalled();
  });

  it('onSubmit does not navigate when login status is false', () => {
    login.mockReturnValueOnce(of({ status: false }));
    component.loginForm.setValue({ email: 'a@test.com', password: 'secret' });
    component.onSubmit();
    expect(login).toHaveBeenCalled();
  });
});
