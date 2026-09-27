import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  BusinessEmailVerificationPrivateService,
  ToastService,
  UserEmailVerificationPublicService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { VerificationCodeModal } from './verification-code-modal';

const toastMock = (): { apiError: jest.Mock } => ({ apiError: jest.fn() });

describe('VerificationCodeModal (usuario con email)', () => {
  let component: VerificationCodeModal;
  let fixture: ComponentFixture<VerificationCodeModal>;
  let dialogRef: { close: jest.Mock };
  let userVerificationService: {
    sendVerificationCode: jest.Mock;
    verifyCode: jest.Mock;
    sendUserVerificationCode: jest.Mock;
    verifyUserVerificationCode: jest.Mock;
  };
  let toast: { apiError: jest.Mock };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };
    toast = toastMock();
    userVerificationService = {
      sendVerificationCode: jest.fn(() => of({ success: true })),
      verifyCode: jest.fn(() => of({ success: true })),
      sendUserVerificationCode: jest.fn(() => of({ success: true })),
      verifyUserVerificationCode: jest.fn(() => of({ success: true })),
    };

    await TestBed.configureTestingModule({
      imports: [VerificationCodeModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: ToastService, useValue: toast },
        { provide: DynamicDialogRef, useValue: dialogRef },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { type: 'user', email: 'usuario@lineup.com' } },
        },
        {
          provide: UserEmailVerificationPublicService,
          useValue: userVerificationService,
        },
        {
          provide: BusinessEmailVerificationPrivateService,
          useValue: {
            sendVerificationCode: jest.fn(() => of({ success: true })),
            verifyCode: jest.fn(() => of({ success: true })),
            sendBusinessVerificationCode: jest.fn(() => of({ success: true })),
            verifyBusinessVerificationCode: jest.fn(() => of({ success: true })),
          },
        },
      ],
    })
      .overrideComponent(VerificationCodeModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(VerificationCodeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe enmascarar el email al iniciar', () => {
    expect(component.maskedEmail).toBe('usu****@lineup.com');
  });

  it('debe solicitar el código al iniciar', () => {
    expect(userVerificationService.sendVerificationCode).toHaveBeenCalledWith({
      email: 'usuario@lineup.com',
    });
  });

  it('debe cerrar con false al cancelar', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('debe verificar el código y cerrar con true', () => {
    component.form.patchValue({ code: '123456' });
    component.submit();
    expect(userVerificationService.verifyCode).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('no debe enviar formulario inválido', () => {
    component.submit();
    expect(userVerificationService.verifyCode).not.toHaveBeenCalled();
  });

  it('debe reenviar código', () => {
    component.resendCode();
    expect(userVerificationService.sendVerificationCode).toHaveBeenCalledTimes(2);
    expect(component.resending).toBe(false);
  });

  it('no debe reenviar si ya está reenviando', () => {
    component.resending = true;
    component.resendCode();
    expect(userVerificationService.sendVerificationCode).toHaveBeenCalledTimes(1);
  });

  it('debe delegar el error de verificación al toast estándar', () => {
    const error = new Error('Código inválido');
    userVerificationService.verifyCode.mockReturnValue(throwError(() => error));
    component.form.patchValue({ code: '000000' });
    component.submit();
    expect(toast.apiError).toHaveBeenCalledWith(error);
    expect(component.attempt).toBe(false);
  });

  it('debe delegar el error del envío inicial al toast estándar', () => {
    const error = new Error('No se pudo enviar');
    userVerificationService.sendVerificationCode.mockReturnValue(
      throwError(() => error),
    );
    const fix = TestBed.createComponent(VerificationCodeModal);
    fix.detectChanges();
    expect(toast.apiError).toHaveBeenCalledWith(error);
  });
});

describe('VerificationCodeModal (usuario sin email)', () => {
  let component: VerificationCodeModal;
  let fixture: ComponentFixture<VerificationCodeModal>;
  let userVerificationService: {
    sendUserVerificationCode: jest.Mock;
    verifyUserVerificationCode: jest.Mock;
  };

  beforeEach(async () => {
    userVerificationService = {
      sendUserVerificationCode: jest.fn(() => of({ success: true })),
      verifyUserVerificationCode: jest.fn(() => of({ success: true })),
    };

    await TestBed.configureTestingModule({
      imports: [VerificationCodeModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: ToastService, useValue: toastMock() },
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: { type: 'user' } } },
        {
          provide: UserEmailVerificationPublicService,
          useValue: {
            sendVerificationCode: jest.fn(),
            verifyCode: jest.fn(),
            ...userVerificationService,
          },
        },
        {
          provide: BusinessEmailVerificationPrivateService,
          useValue: {
            sendVerificationCode: jest.fn(),
            verifyCode: jest.fn(),
            sendBusinessVerificationCode: jest.fn(),
            verifyBusinessVerificationCode: jest.fn(),
          },
        },
      ],
    })
      .overrideComponent(VerificationCodeModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(VerificationCodeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe usar sendUserVerificationCode sin email', () => {
    expect(userVerificationService.sendUserVerificationCode).toHaveBeenCalled();
    expect(component.maskedEmail).toBeNull();
  });

  it('debe verificar con verifyUserVerificationCode', () => {
    component.form.patchValue({ code: '999999' });
    component.submit();
    expect(userVerificationService.verifyUserVerificationCode).toHaveBeenCalledWith({
      code: '999999',
    });
  });
});

describe('VerificationCodeModal (negocio)', () => {
  let component: VerificationCodeModal;
  let fixture: ComponentFixture<VerificationCodeModal>;
  let toast: { apiError: jest.Mock };
  let businessService: {
    sendVerificationCode: jest.Mock;
    verifyCode: jest.Mock;
    sendBusinessVerificationCode: jest.Mock;
    verifyBusinessVerificationCode: jest.Mock;
  };

  beforeEach(async () => {
    toast = toastMock();
    businessService = {
      sendVerificationCode: jest.fn(() => of({ success: true })),
      verifyCode: jest.fn(() => of({ success: true })),
      sendBusinessVerificationCode: jest.fn(() => of({ success: true })),
      verifyBusinessVerificationCode: jest.fn(() => of({ success: true })),
    };

    await TestBed.configureTestingModule({
      imports: [VerificationCodeModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: ToastService, useValue: toast },
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { type: 'business', email: 'biz@lineup.com' } },
        },
        {
          provide: UserEmailVerificationPublicService,
          useValue: {
            sendVerificationCode: jest.fn(),
            verifyCode: jest.fn(),
            sendUserVerificationCode: jest.fn(),
            verifyUserVerificationCode: jest.fn(),
          },
        },
        { provide: BusinessEmailVerificationPrivateService, useValue: businessService },
      ],
    })
      .overrideComponent(VerificationCodeModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(VerificationCodeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe enmascarar email corto', () => {
    expect(component.maskedEmail).toBe('biz@lineup.com'.replace('biz', 'biz'));
  });

  it('debe enviar código de negocio con email', () => {
    expect(businessService.sendVerificationCode).toHaveBeenCalled();
  });

  it('debe verificar código de negocio', () => {
    component.form.patchValue({ code: '111111' });
    component.submit();
    expect(businessService.verifyCode).toHaveBeenCalled();
  });

  it('debe reenviar y delegar el error al toast estándar', () => {
    const error = new Error('Error GraphQL');
    businessService.sendVerificationCode.mockReturnValue(
      throwError(() => error),
    );
    component.resendCode();
    expect(component.resending).toBe(false);
    expect(toast.apiError).toHaveBeenCalledWith(error);
  });
});

describe('VerificationCodeModal (negocio sin email)', () => {
  let businessService: {
    sendBusinessVerificationCode: jest.Mock;
    verifyBusinessVerificationCode: jest.Mock;
  };

  beforeEach(async () => {
    businessService = {
      sendBusinessVerificationCode: jest.fn(() => of({ success: true })),
      verifyBusinessVerificationCode: jest.fn(() => of({ success: true })),
    };

    await TestBed.configureTestingModule({
      imports: [VerificationCodeModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: ToastService, useValue: toastMock() },
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        { provide: DynamicDialogConfig, useValue: { data: { type: 'business' } } },
        {
          provide: UserEmailVerificationPublicService,
          useValue: {
            sendVerificationCode: jest.fn(),
            verifyCode: jest.fn(),
            sendUserVerificationCode: jest.fn(),
            verifyUserVerificationCode: jest.fn(),
          },
        },
        { provide: BusinessEmailVerificationPrivateService, useValue: businessService },
      ],
    })
      .overrideComponent(VerificationCodeModal, { set: { template: '' } })
      .compileComponents();
  });

  it('debe verificar negocio sin email con verifyBusinessVerificationCode', () => {
    const fixture = TestBed.createComponent(VerificationCodeModal);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.form.patchValue({ code: '222222' });
    component.submit();
    expect(businessService.verifyBusinessVerificationCode).toHaveBeenCalledWith({
      code: '222222',
    });
  });
});

describe('VerificationCodeModal enmascaramiento', () => {
  it('debe devolver email sin @ sin cambios', async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationCodeModal, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: ToastService, useValue: toastMock() },
        { provide: DynamicDialogRef, useValue: { close: jest.fn() } },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { type: 'user', email: 'invalid-email' } },
        },
        {
          provide: UserEmailVerificationPublicService,
          useValue: {
            sendVerificationCode: jest.fn(() => of({})),
            verifyCode: jest.fn(),
            sendUserVerificationCode: jest.fn(),
            verifyUserVerificationCode: jest.fn(),
          },
        },
        {
          provide: BusinessEmailVerificationPrivateService,
          useValue: {
            sendVerificationCode: jest.fn(),
            verifyCode: jest.fn(),
            sendBusinessVerificationCode: jest.fn(),
            verifyBusinessVerificationCode: jest.fn(),
          },
        },
      ],
    })
      .overrideComponent(VerificationCodeModal, { set: { template: '' } })
      .compileComponents();

    const fix = TestBed.createComponent(VerificationCodeModal);
    fix.detectChanges();
    expect(fix.componentInstance.maskedEmail).toBe('invalid-email');
  });
});
