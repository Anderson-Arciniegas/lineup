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
import { RouterTestingModule } from '@angular/router/testing';
import { UserPublicService } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, of, throwError } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';
import { RegisterUserPage } from './register-user-page';

/** Contraseña que cumple el patrón del formulario (mayúscula, minúscula, número, especial, 8+). */
const VALID_PASSWORD = 'Password1!';

describe('RegisterUserPage', () => {
  let fixture: ComponentFixture<RegisterUserPage>;
  let component: RegisterUserPage;
  let createUser: jest.Mock;
  let registerWithGoogle: jest.Mock;
  let handleSuccessLogin: jest.Mock;
  let dialogOpen: jest.Mock;
  let onClose$: Subject<boolean>;
  let messageAdd: jest.Mock;
  let credential$: Subject<string>;
  let renderButton: jest.Mock;

  beforeEach(waitForAsync(async () => {
    createUser = jest.fn(() => of({ id: 1 }));
    registerWithGoogle = jest.fn(() => of({ user: { id: 2 } }));
    handleSuccessLogin = jest.fn().mockResolvedValue(undefined);
    onClose$ = new Subject<boolean>();
    dialogOpen = jest.fn(() => ({ onClose: onClose$.asObservable() }));
    messageAdd = jest.fn();
    credential$ = new Subject<string>();
    renderButton = jest.fn();
    const { mock: apolloMock } = createApolloMock();

    await TestBed.configureTestingModule({
      imports: [
        RegisterUserPage,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Apollo, useValue: apolloMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
        TranslateService,
        TranslateStore,
        { provide: DialogService, useValue: { open: dialogOpen } },
        { provide: MessageService, useValue: { add: messageAdd } },
        {
          provide: UserPublicService,
          useValue: { createUser, registerWithGoogle },
        },
        { provide: AuthService, useValue: { handleSuccessLogin } },
        {
          provide: GoogleAuthService,
          useValue: { credential$, renderButton },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterUserPage);
    component = fixture.componentInstance;
  });

  beforeEach(fakeAsync(() => {
    fixture.detectChanges();
    tick(150);
  }));

  it('debe crear el componente con formulario reactivo', () => {
    expect(component).toBeTruthy();
    expect(component.registerUserForm).toBeDefined();
  });

  /**
   * Campos obligatorios, email y reglas de contraseña + confirmación coincidente.
   */
  describe('validación del formulario', () => {
    it('debe ser inválido con campos vacíos', () => {
      expect(component.registerUserForm.valid).toBe(false);
    });

    it('debe ser válido con datos correctos', () => {
      component.registerUserForm.patchValue({
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana@test.com',
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        acceptTerms: true,
      });
      expect(component.registerUserForm.valid).toBe(true);
    });

    it('debe fallar si las contraseñas no coinciden', () => {
      component.registerUserForm.patchValue({
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana@test.com',
        password: VALID_PASSWORD,
        confirmPassword: 'Other1!',
      });
      expect(component.registerUserForm.valid).toBe(false);
    });
  });

  /**
   * Flujo registro: modal de verificación y luego `createUser`.
   */
  describe('onSubmit (registro email)', () => {
    it('no debe abrir el diálogo si el formulario es inválido', () => {
      component.onSubmit();
      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('debe abrir el modal de verificación con email y tipo user', () => {
      component.registerUserForm.patchValue({
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana@test.com',
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        acceptTerms: true,
      });
      component.onSubmit();
      expect(dialogOpen).toHaveBeenCalled();
      const cfg = dialogOpen.mock.calls[0][1];
      expect(cfg.data).toEqual(
        expect.objectContaining({ type: 'user', email: 'ana@test.com' }),
      );
    });

    it('debe llamar createUser cuando el modal cierra con verificación ok', () => {
      component.registerUserForm.patchValue({
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana@test.com',
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        acceptTerms: true,
      });
      component.onSubmit();
      onClose$.next(true);
      expect(createUser).toHaveBeenCalled();
      expect(createUser.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          firstName: 'Ana',
          lastName: 'López',
          email: 'ana@test.com',
          password: VALID_PASSWORD,
        }),
      );
    });

    it('no debe crear usuario si el modal cierra sin verificar', () => {
      component.registerUserForm.patchValue({
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana@test.com',
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        acceptTerms: true,
      });
      component.onSubmit();
      onClose$.next(false);
      expect(createUser).not.toHaveBeenCalled();
      expect(component.attempt).toBe(false);
    });

    it('debe mostrar mensaje de error si createUser falla', () => {
      createUser.mockReturnValue(
        throwError(() => ({ message: 'email taken' })),
      );
      component.registerUserForm.patchValue({
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana@test.com',
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        acceptTerms: true,
      });
      component.onSubmit();
      onClose$.next(true);
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });
  });

  /**
   * Registro con token de Google y `registerWithGoogle`.
   */
  describe('Google Sign-Up', () => {
    it('debe invocar renderButton al inicializar', fakeAsync(() => {
      tick(150);
      expect(renderButton).toHaveBeenCalled();
    }));

    it('debe registrar con Google y completar sesión', fakeAsync(() => {
      tick(150);
      credential$.next('jwt-google');
      tick();
      expect(registerWithGoogle).toHaveBeenCalled();
      expect(handleSuccessLogin).toHaveBeenCalled();
      expect(component.attemptGoogle).toBe(false);
    }));
  });

  describe('ciclo de vida', () => {
    it('debe destruir sin error', () => {
      expect(() => fixture.destroy()).not.toThrow();
    });
  });
});
