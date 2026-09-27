import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  AuthStore,
  BusinessPrivateService,
  ToastService,
  UserPublicService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { UpdateEmailModal } from './update-email-modal';

type ToastMock = { apiError: jest.Mock; warn: jest.Mock };
const toastMock = (): ToastMock => ({ apiError: jest.fn(), warn: jest.fn() });

describe('UpdateEmailModal', () => {
  let component: UpdateEmailModal;
  let fixture: ComponentFixture<UpdateEmailModal>;
  let dialogRef: { close: jest.Mock };
  let toast: ToastMock;
  let dialogService: { open: jest.Mock };
  let userService: { updateUserEmail: jest.Mock };
  let authStore: { setUser: jest.Mock; setBusiness: jest.Mock };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    toast = toastMock();
    dialogService = {
      open: jest.fn(() => ({ onClose: of(false) })),
    };
    userService = { updateUserEmail: jest.fn(() => of({ id: 1 })) };
    authStore = { setUser: jest.fn(), setBusiness: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [UpdateEmailModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: ToastService, useValue: toast },
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: { type: 'user', currentEmail: 'actual@lineup.com' },
          },
        },
        { provide: DialogService, useValue: dialogService },
        {
          provide: UserPublicService,
          useValue: userService,
        },
        {
          provide: BusinessPrivateService,
          useValue: { updateBusinessEmail: jest.fn(() => of({ id: 1 })) },
        },
        { provide: AuthStore, useValue: authStore },
      ],
    })
      .overrideComponent(UpdateEmailModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(UpdateEmailModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('formulario', () => {
    it('debe inicializar el email actual desde la config', () => {
      expect(component.form.get('email')?.value).toBe('actual@lineup.com');
    });

    it('debe ser inválido con email mal formado', () => {
      component.form.patchValue({ email: 'no-es-email' });
      expect(component.form.valid).toBe(false);
    });

    it('debe ser válido con un email distinto al actual', () => {
      component.form.patchValue({ email: 'nuevo@lineup.com' });
      expect(component.form.valid).toBe(true);
    });
  });

  it('debe cerrar con false al cancelar', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('debe advertir si el email no cambió', () => {
    component.form.patchValue({ email: 'actual@lineup.com' });
    component.proceedToVerification();
    expect(toast.warn).toHaveBeenCalledWith('validation.emailUnchanged');
    expect(dialogService.open).not.toHaveBeenCalled();
  });

  it('debe abrir verificación y actualizar email de usuario', () => {
    dialogService.open.mockReturnValue({ onClose: of(true) });
    component.form.patchValue({ email: 'nuevo@lineup.com' });
    component.proceedToVerification();
    expect(dialogService.open).toHaveBeenCalled();
  });

  it('no debe proceder con formulario inválido', () => {
    component.form.patchValue({ email: '' });
    component.proceedToVerification();
    expect(dialogService.open).not.toHaveBeenCalled();
  });

  it('no debe actualizar si la verificación falla', () => {
    dialogService.open.mockReturnValue({ onClose: of(false) });
    component.form.patchValue({ email: 'nuevo@lineup.com' });
    component.proceedToVerification();
    expect(userService.updateUserEmail).not.toHaveBeenCalled();
  });

  it('debe actualizar email de usuario tras verificación exitosa', () => {
    dialogService.open.mockReturnValue({ onClose: of(true) });
    component.form.patchValue({ email: 'nuevo@lineup.com' });
    component.proceedToVerification();
    expect(userService.updateUserEmail).toHaveBeenCalledWith({
      email: 'nuevo@lineup.com',
    });
    expect(authStore.setUser).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('debe delegar el error de actualización al toast estándar', () => {
    const error = new Error('Email en uso');
    userService.updateUserEmail.mockReturnValue(throwError(() => error));
    dialogService.open.mockReturnValue({ onClose: of(true) });
    component.form.patchValue({ email: 'nuevo@lineup.com' });
    component.proceedToVerification();
    expect(toast.apiError).toHaveBeenCalledWith(error);
    expect(component.attempt).toBe(false);
  });

  it('no debe proceder si attempt está activo', () => {
    component.attempt = true;
    component.form.patchValue({ email: 'nuevo@lineup.com' });
    component.proceedToVerification();
    expect(dialogService.open).not.toHaveBeenCalled();
  });
});

describe('UpdateEmailModal (negocio)', () => {
  let component: UpdateEmailModal;
  let fixture: ComponentFixture<UpdateEmailModal>;
  let businessService: { updateBusinessEmail: jest.Mock };
  let authStore: { setBusiness: jest.Mock; setUser: jest.Mock };
  let toast: ToastMock;

  beforeEach(async () => {
    businessService = { updateBusinessEmail: jest.fn(() => of({ id: 1 })) };
    authStore = { setBusiness: jest.fn(), setUser: jest.fn() };
    toast = toastMock();

    await TestBed.configureTestingModule({
      imports: [UpdateEmailModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: ToastService, useValue: toast },
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { type: 'business', currentEmail: 'biz@lineup.com' } },
        },
        {
          provide: DialogService,
          useValue: { open: jest.fn(() => ({ onClose: of(true) })) },
        },
        { provide: UserPublicService, useValue: { updateUserEmail: jest.fn() } },
        { provide: BusinessPrivateService, useValue: businessService },
        { provide: AuthStore, useValue: authStore },
      ],
    })
      .overrideComponent(UpdateEmailModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(UpdateEmailModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe actualizar email de negocio tras verificación', () => {
    component.form.patchValue({ email: 'nuevo-biz@lineup.com' });
    component.proceedToVerification();
    expect(businessService.updateBusinessEmail).toHaveBeenCalledWith({
      email: 'nuevo-biz@lineup.com',
    });
    expect(authStore.setBusiness).toHaveBeenCalled();
  });

  it('debe delegar el error de actualización de negocio al toast estándar', () => {
    const error = new Error('fail');
    businessService.updateBusinessEmail.mockReturnValue(
      throwError(() => error),
    );
    component.form.patchValue({ email: 'nuevo-biz@lineup.com' });
    component.proceedToVerification();
    expect(toast.apiError).toHaveBeenCalledWith(error);
    expect(component.attempt).toBe(false);
  });
});

describe('UpdateEmailModal sin data', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateEmailModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: ToastService, useValue: toastMock() },
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: undefined } },
        {
          provide: DialogService,
          useValue: { open: jest.fn(() => ({ onClose: of(false) })) },
        },
        {
          provide: UserPublicService,
          useValue: { updateUserEmail: jest.fn(() => of({ id: 1 })) },
        },
        {
          provide: BusinessPrivateService,
          useValue: { updateBusinessEmail: jest.fn(() => of({ id: 1 })) },
        },
        {
          provide: AuthStore,
          useValue: { setUser: jest.fn(), setBusiness: jest.fn() },
        },
      ],
    })
      .overrideComponent(UpdateEmailModal, { set: { template: '' } })
      .compileComponents();
  });

  it('debe usar tipo user y email vacío por defecto', () => {
    const fixture = TestBed.createComponent(UpdateEmailModal);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    expect(cmp.modalType).toBe('user');
    expect(cmp.form.get('email')?.value).toBe('');
  });
});
