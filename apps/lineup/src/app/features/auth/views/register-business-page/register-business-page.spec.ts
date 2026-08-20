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
import { BusinessPrivateService } from '@lineup/core';
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
import { RegisterBusinessPage } from './register-business-page';

const VALID_PASSWORD = 'Password1!';

describe('RegisterBusinessPage', () => {
  let fixture: ComponentFixture<RegisterBusinessPage>;
  let component: RegisterBusinessPage;
  let createBusiness: jest.Mock;
  let registerWithGoogle: jest.Mock;
  let handleSuccessLogin: jest.Mock;
  let dialogOpen: jest.Mock;
  let onClose$: Subject<boolean>;
  let messageAdd: jest.Mock;
  let credential$: Subject<string>;
  let renderButton: jest.Mock;

  beforeEach(waitForAsync(async () => {
    createBusiness = jest.fn(() => of({ id: 1, path: 'biz' }));
    registerWithGoogle = jest.fn(() => of({ business: { id: 2 } }));
    handleSuccessLogin = jest.fn().mockResolvedValue(undefined);
    onClose$ = new Subject<boolean>();
    dialogOpen = jest.fn(() => ({ onClose: onClose$.asObservable() }));
    messageAdd = jest.fn();
    credential$ = new Subject<string>();
    renderButton = jest.fn();
    const { mock: apolloMock } = createApolloMock();

    await TestBed.configureTestingModule({
      imports: [
        RegisterBusinessPage,
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
          provide: BusinessPrivateService,
          useValue: { createBusiness, registerWithGoogle },
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
    fixture = TestBed.createComponent(RegisterBusinessPage);
    component = fixture.componentInstance;
  });

  beforeEach(fakeAsync(() => {
    fixture.detectChanges();
    tick(150);
  }));

  it('debe crear el componente con formulario', () => {
    expect(component).toBeTruthy();
    expect(component.registerBusinessForm).toBeDefined();
  });

  /**
   * Nombre, email y contraseñas con las mismas reglas que usuario.
   */
  describe('validación del formulario', () => {
    it('debe ser inválido vacío', () => {
      expect(component.registerBusinessForm.valid).toBe(false);
    });

    it('debe ser válido con datos correctos', () => {
      component.registerBusinessForm.patchValue({
        name: 'Mi tienda',
        email: 'shop@test.com',
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        acceptTerms: true,
      });
      expect(component.registerBusinessForm.valid).toBe(true);
    });
  });

  /**
   * Modal de código y `createBusiness` tras verificación.
   */
  describe('onSubmit', () => {
    it('no debe abrir diálogo si el formulario es inválido', () => {
      component.onSubmit();
      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('debe abrir verificación con tipo business', () => {
      component.registerBusinessForm.patchValue({
        name: 'Tienda',
        email: 't@test.com',
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        acceptTerms: true,
      });
      component.onSubmit();
      expect(dialogOpen.mock.calls[0][1].data).toEqual(
        expect.objectContaining({ type: 'business', email: 't@test.com' }),
      );
    });

    it('debe llamar createBusiness y login con negocio nuevo al verificar', () => {
      component.registerBusinessForm.patchValue({
        name: 'Tienda',
        email: 't@test.com',
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
        acceptTerms: true,
      });
      component.onSubmit();
      onClose$.next(true);
      expect(createBusiness).toHaveBeenCalled();
      expect(handleSuccessLogin).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ id: 1, path: 'biz' }),
        true,
      );
    });

    it('debe notificar error si createBusiness falla', () => {
      createBusiness.mockReturnValue(throwError(() => ({ message: 'err' })));
      component.registerBusinessForm.patchValue({
        name: 'Tienda',
        email: 't@test.com',
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

  describe('Google Sign-Up', () => {
    it('debe invocar renderButton al inicializar', fakeAsync(() => {
      tick(150);
      expect(renderButton).toHaveBeenCalled();
    }));

    it('debe registrar negocio con Google', fakeAsync(() => {
      tick(150);
      credential$.next('jwt');
      tick();
      expect(registerWithGoogle).toHaveBeenCalled();
      expect(handleSuccessLogin).toHaveBeenCalled();
    }));
  });
});
