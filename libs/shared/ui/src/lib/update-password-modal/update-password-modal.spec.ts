import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BusinessPrivateService, UserPublicService } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { UpdatePasswordModal } from './update-password-modal';

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
        MessageService,
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

  beforeEach(async () => {
    businessService = { changeBusinessPassword: jest.fn(() => of(true)) };

    await TestBed.configureTestingModule({
      imports: [UpdatePasswordModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        MessageService,
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

  it('debe mostrar error si falla cambio de negocio', () => {
    const messageService = TestBed.inject(MessageService) as MessageService & {
      add: jest.Mock;
    };
    jest.spyOn(messageService, 'add');
    businessService.changeBusinessPassword.mockReturnValue(
      throwError(() => ({ message: 'Business password fail' })),
    );
    component.form.patchValue({
      currentPassword: 'old',
      newPassword: 'new123',
      confirmNewPassword: 'new123',
    });
    component.submit();
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });
});

describe('UpdatePasswordModal errores', () => {
  let component: UpdatePasswordModal;
  let fixture: ComponentFixture<UpdatePasswordModal>;
  let messageService: { add: jest.Mock };

  beforeEach(async () => {
    messageService = { add: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [UpdatePasswordModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: MessageService, useValue: messageService },
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: { type: 'user' } } },
        {
          provide: UserPublicService,
          useValue: {
            changePassword: jest.fn(() =>
              throwError(() => ({ message: 'Error de contraseña' })),
            ),
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

  it('debe mostrar error si falla el cambio', () => {
    component.form.patchValue({
      currentPassword: 'old',
      newPassword: 'new123',
      confirmNewPassword: 'new123',
    });
    component.submit();
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
    expect(component.attempt).toBe(false);
  });

  it('no debe enviar si attempt está activo', () => {
    component.attempt = true;
    component.submit();
    expect(messageService.add).not.toHaveBeenCalled();
  });
});

describe('UpdatePasswordModal error GraphQL', () => {
  it('debe mostrar mensaje GraphQL al fallar cambio', async () => {
    const messageService = { add: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [UpdatePasswordModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: MessageService, useValue: messageService },
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: { type: 'user' } } },
        {
          provide: UserPublicService,
          useValue: {
            changePassword: jest.fn(() =>
              throwError(() => ({ graphQLErrors: [{ message: 'Bad password' }] })),
            ),
          },
        },
        { provide: BusinessPrivateService, useValue: { changeBusinessPassword: jest.fn() } },
      ],
    })
      .overrideComponent(UpdatePasswordModal, { set: { template: '' } })
      .compileComponents();
    const fixture = TestBed.createComponent(UpdatePasswordModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.form.patchValue({
      currentPassword: 'old',
      newPassword: 'new123',
      confirmNewPassword: 'new123',
    });
    component.submit();
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'Bad password' }),
    );
  });
});
