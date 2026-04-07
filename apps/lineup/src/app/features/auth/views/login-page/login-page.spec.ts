import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BusinessPrivateService, UserPublicService } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { Subject, of, throwError } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;
  let userLogin: jest.Mock;
  let businessLogin: jest.Mock;
  let userLoginWithGoogle: jest.Mock;
  let businessLoginWithGoogle: jest.Mock;
  let handleSuccessLogin: jest.Mock;
  let credential$: Subject<string>;
  let renderButton: jest.Mock;

  beforeEach(waitForAsync(async () => {
    userLogin = jest.fn(() => of({ id: 1 }));
    businessLogin = jest.fn(() => of(null));
    userLoginWithGoogle = jest.fn(() => of({ user: { id: 1 } }));
    businessLoginWithGoogle = jest.fn();
    handleSuccessLogin = jest.fn().mockResolvedValue(undefined);
    credential$ = new Subject<string>();
    renderButton = jest.fn();

    const { mock: apolloMock } = createApolloMock();

    await TestBed.configureTestingModule({
      imports: [LoginPage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Apollo, useValue: apolloMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
        TranslateService,
        TranslateStore,
        {
          provide: UserPublicService,
          useValue: {
            login: userLogin,
            loginWithGoogle: userLoginWithGoogle,
          },
        },
        {
          provide: BusinessPrivateService,
          useValue: {
            login: businessLogin,
            loginWithGoogle: businessLoginWithGoogle,
          },
        },
        { provide: AuthService, useValue: { handleSuccessLogin } },
        {
          provide: GoogleAuthService,
          useValue: {
            credential$,
            renderButton,
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
  });

  /** Tras el primer render, `ngAfterViewInit` programa `renderButton` con `setTimeout(100)`. */
  beforeEach(fakeAsync(() => {
    fixture.detectChanges();
    tick(150);
  }));

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm).toBeDefined();
  });

  /**
   * El formulario exige email y contraseña antes de enviar credenciales al API.
   */
  describe('validación del formulario', () => {
    it('debe marcar el formulario inválido si faltan campos', () => {
      expect(component.loginForm.valid).toBe(false);
    });

    it('debe ser válido con email y contraseña rellenados', () => {
      component.loginForm.patchValue({
        email: 'a@b.com',
        password: 'secret',
      });
      expect(component.loginForm.valid).toBe(true);
    });
  });

  /**
   * Envío email/contraseña: primero usuario, si falla reintenta como negocio.
   */
  describe('onSubmit (login email)', () => {
    it('no debe llamar a login si el formulario es inválido', () => {
      component.onSubmit();
      expect(userLogin).not.toHaveBeenCalled();
    });

    it('no debe enviar si ya hay un intento en curso', () => {
      component.loginForm.patchValue({
        email: 'a@b.com',
        password: 'x',
      });
      component.attempt = true;
      component.onSubmit();
      expect(userLogin).not.toHaveBeenCalled();
    });

    it('debe llamar a UserPublicService.login con email y contraseña', () => {
      component.loginForm.patchValue({
        email: 'user@test.com',
        password: 'pass123',
      });
      component.onSubmit();
      expect(userLogin).toHaveBeenCalledWith('user@test.com', 'pass123');
    });

    it('debe delegar en AuthService cuando el usuario existe', () => {
      const user = { id: 99 } as any;
      userLogin.mockReturnValue(of(user));
      component.loginForm.patchValue({
        email: 'u@t.com',
        password: 'p',
      });
      component.onSubmit();
      expect(handleSuccessLogin).toHaveBeenCalledWith(user);
      expect(component.attempt).toBe(false);
    });

    it('debe intentar login de negocio si falla el de usuario', () => {
      userLogin.mockReturnValue(throwError(() => new Error('fail')));
      businessLogin.mockReturnValue(of({ id: 2 }));
      component.loginForm.patchValue({
        email: 'b@t.com',
        password: 'p',
      });
      component.onSubmit();
      expect(businessLogin).toHaveBeenCalledWith('b@t.com', 'p');
      expect(handleSuccessLogin).toHaveBeenCalledWith(null, { id: 2 });
    });

    it('debe poner attempt en false si ambos logins fallan', () => {
      userLogin.mockReturnValue(throwError(() => new Error('u')));
      businessLogin.mockReturnValue(throwError(() => new Error('b')));
      component.loginForm.patchValue({
        email: 'x@y.com',
        password: 'p',
      });
      component.onSubmit();
      expect(component.attempt).toBe(false);
    });
  });

  /**
   * Botón Google: el contenedor dispara `renderButton` y el token llega por `credential$`.
   */
  describe('integración Google Sign-In', () => {
    it('debe invocar renderButton tras el timeout de vista', () => {
      expect(renderButton).toHaveBeenCalled();
    });

    it('debe llamar loginWithGoogle y handleSuccessLogin con usuario', fakeAsync(() => {
      credential$.next('google-jwt');
      tick();
      expect(userLoginWithGoogle).toHaveBeenCalledWith({ token: 'google-jwt' });
      expect(handleSuccessLogin).toHaveBeenCalledWith({ id: 1 });
      expect(component.attemptGoogle).toBe(false);
    }));

    it('debe reintentar con BusinessPrivateService si usuario Google falla y negocio ok', fakeAsync(() => {
      userLoginWithGoogle.mockReturnValue(throwError(() => new Error('no')));
      businessLoginWithGoogle.mockReturnValue(
        of({ business: { id: 3 } } as any),
      );
      credential$.next('token-b');
      tick();
      expect(businessLoginWithGoogle).toHaveBeenCalledWith({ token: 'token-b' });
      expect(handleSuccessLogin).toHaveBeenCalledWith(undefined, { id: 3 });
    }));
  });

  /**
   * Limpieza de suscripciones al destruir el componente.
   */
  describe('ciclo de vida', () => {
    it('debe completar sin error al destruir', () => {
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });
  });
});
