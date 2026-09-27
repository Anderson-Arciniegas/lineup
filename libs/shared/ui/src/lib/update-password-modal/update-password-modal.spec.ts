import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  BusinessPrivateService,
  ToastService,
  UserPublicService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { UpdatePasswordModal } from './update-password-modal';

const toastMock = (): { apiError: jest.Mock } => ({ apiError: jest.fn() });

describe('UpdatePasswordModal', () => {
  let component: UpdatePasswordModal;
  let fixture: ComponentFixture<UpdatePasswordModal>;
  let dialogRef: { close: jest.Mock };
  let userService: { changePassword: jest.Mock };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    userService = { changePassword: jest.fn(() => of(true)) };

    await TestBed.configureTestingModule({
      imports: [UpdatePasswordModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: ToastService, useValue: toastMock() },
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { type: 'user' } },
        },
        { provide: UserPublicService, useValue: userService },
        {
          provide: BusinessPrivateService,
          useValue: { changeBusinessPassword: jest.fn(() => of(true)) },
        },
      ],
    })
      .overrideComponent(UpdatePasswordModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(UpdatePasswordModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('validación del formulario', () => {
    it('debe ser inválido al iniciar', () => {
      expect(component.form.valid).toBe(false);
    });

    it('debe detectar contraseñas que no coinciden', () => {
      component.form.patchValue({
        currentPassword: 'old-pass',
        newPassword: 'new-pass',
        confirmNewPassword: 'otra-pass',
      });
      component.confirmNewPasswordControl?.markAsDirty();
      expect(component.form.errors?.['passwordMismatch']).toBe(true);
      expect(component.isConfirmPasswordMismatch).toBe(true);
    });

    it('debe ser válido cuando las contraseñas coinciden', () => {
      component.form.patchValue({
        currentPassword: 'old-pass',
        newPassword: 'new-pass',
        confirmNewPassword: 'new-pass',
      });
      expect(component.form.valid).toBe(true);
    });

    it('debe exponer controles del formulario', () => {
      expect(component.currentPasswordControl).toBeTruthy();
      expect(component.newPasswordControl).toBeTruthy();
      expect(component.confirmNewPasswordControl).toBeTruthy();
    });

    it('no debe marcar mismatch si confirmación no fue tocada', () => {
      component.form.patchValue({
        currentPassword: 'old',
        newPassword: 'a',
        confirmNewPassword: 'b',
      });
      expect(component.isConfirmPasswordMismatch).toBe(false);
    });
  });

  it('no debe enviar formulario inválido', () => {
    component.submit();
    expect(userService.changePassword).not.toHaveBeenCalled();
  });

  it('debe cerrar con false al cancelar', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('debe enviar la solicitud y cerrar con true al submit exitoso', () => {
    component.form.patchValue({
      currentPassword: 'old-pass',
      newPassword: 'new-pass',
      confirmNewPassword: 'new-pass',
    });
    component.submit();
    expect(userService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'old-pass',
      newPassword: 'new-pass',
    });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});

describe('UpdatePasswordModal (negocio)', () => {
  let component: UpdatePasswordModal;
  let fixture: ComponentFixture<UpdatePasswordModal>;
  let businessService: { changeBusinessPassword: jest.Mock };
  let toast: { apiError: jest.Mock };

  beforeEach(async () => {
    businessService = { changeBusinessPassword: jest.fn(() => of(true)) };
    toast = toastMock();

    await TestBed.configureTestingModule({
      imports: [UpdatePasswordModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: ToastService, useValue: toast },
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: { type: 'business' } } },
        { provide: UserPublicService, useValue: { changePassword: jest.fn() } },
        { provide: BusinessPrivateService, useValue: businessService },
      ],
    })
      .overrideComponent(UpdatePasswordModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(UpdatePasswordModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe usar changeBusinessPassword para negocio', () => {
    component.form.patchValue({
      currentPassword: 'old',
      newPassword: 'new123',
      confirmNewPassword: 'new123',
    });
    component.submit();
    expect(businessService.changeBusinessPassword).toHaveBeenCalled();
  });

  it('debe delegar el error del cambio de negocio al toast estándar', () => {
    const error = new Error('Business password fail');
    businessService.changeBusinessPassword.mockReturnValue(
      throwError(() => error),
    );
    component.form.patchValue({
      currentPassword: 'old',
      newPassword: 'new123',
      confirmNewPassword: 'new123',
    });
    component.submit();
    expect(toast.apiError).toHaveBeenCalledWith(error);
  });
});

describe('UpdatePasswordModal errores', () => {
  let component: UpdatePasswordModal;
  let fixture: ComponentFixture<UpdatePasswordModal>;
  let toast: { apiError: jest.Mock };
  const changePasswordError = new Error('Error de contraseña');

  beforeEach(async () => {
    toast = toastMock();

    await TestBed.configureTestingModule({
      imports: [UpdatePasswordModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: ToastService, useValue: toast },
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: { type: 'user' } } },
        {
          provide: UserPublicService,
          useValue: {
            changePassword: jest.fn(() => throwError(() => changePasswordError)),
          },
        },
        {
          provide: BusinessPrivateService,
          useValue: { changeBusinessPassword: jest.fn() },
        },
      ],
    })
      .overrideComponent(UpdatePasswordModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(UpdatePasswordModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe delegar el error del cambio al toast estándar', () => {
    component.form.patchValue({
      currentPassword: 'old',
      newPassword: 'new123',
      confirmNewPassword: 'new123',
    });
    component.submit();
    expect(toast.apiError).toHaveBeenCalledWith(changePasswordError);
    expect(component.attempt).toBe(false);
  });

  it('no debe enviar si attempt está activo', () => {
    component.attempt = true;
    component.submit();
    expect(toast.apiError).not.toHaveBeenCalled();
  });
});
