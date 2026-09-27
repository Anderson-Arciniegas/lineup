import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ApiError } from '../models/api-error.model';
import { ApiErrorService } from './api-error.service';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let messageAdd: jest.Mock;
  let normalize: jest.Mock;
  let isCookieNotSentError: jest.Mock;

  const configure = (platformId: string): void => {
    messageAdd = jest.fn();
    isCookieNotSentError = jest.fn(() => false);
    normalize = jest.fn(
      (): ApiError => ({
        httpStatus: 500,
        message: 'raw',
        i18nKey: 'errors.server',
        original: null,
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: MessageService, useValue: { add: messageAdd } },
        {
          provide: TranslateService,
          useValue: {
            instant: jest.fn(
              (key: string, params?: Record<string, unknown>) =>
                params ? `${key}:${JSON.stringify(params)}` : `t(${key})`,
            ),
          },
        },
        {
          provide: ApiErrorService,
          useValue: { normalize, isCookieNotSentError },
        },
      ],
    });
    service = TestBed.inject(ToastService);
  };

  beforeEach(() => {
    jest.useFakeTimers();
    configure('browser');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('error muestra toast con summary/detail traducidos y life de error', () => {
    service.error('errors.generic');

    expect(messageAdd).toHaveBeenCalledWith({
      severity: 'error',
      summary: 't(general.error)',
      detail: 't(errors.generic)',
      life: ToastService.ERROR_LIFE_MS,
    });
  });

  it('success/info/warn usan su summary y life por defecto', () => {
    service.success('toast.ok');
    service.info('toast.i');
    service.warn('toast.w');

    expect(messageAdd).toHaveBeenNthCalledWith(1, {
      severity: 'success',
      summary: 't(general.success)',
      detail: 't(toast.ok)',
      life: ToastService.DEFAULT_LIFE_MS,
    });
    expect(messageAdd).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ severity: 'info', summary: 't(general.info)' }),
    );
    expect(messageAdd).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ severity: 'warn', summary: 't(general.warning)' }),
    );
  });

  it('pasa parámetros de interpolación al detail', () => {
    service.success('toast.saved', { name: 'X' });

    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'toast.saved:{"name":"X"}' }),
    );
  });

  it('deduplica el mismo mensaje dentro de la ventana y lo permite después', () => {
    service.error('errors.generic');
    service.error('errors.generic');
    expect(messageAdd).toHaveBeenCalledTimes(1);

    service.error('errors.network');
    expect(messageAdd).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(ToastService.DEDUPE_WINDOW_MS + 1);
    service.error('errors.generic');
    expect(messageAdd).toHaveBeenCalledTimes(3);
  });

  it('resetDedupe permite repetir de inmediato', () => {
    service.error('errors.generic');
    service.resetDedupe();
    service.error('errors.generic');
    expect(messageAdd).toHaveBeenCalledTimes(2);
  });

  it('apiError normaliza, muestra la clave resuelta y devuelve el ApiError', () => {
    const original = new Error('x');
    const result = service.apiError(original);

    expect(normalize).toHaveBeenCalledWith(original);
    expect(result.i18nKey).toBe('errors.server');
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: 't(errors.server)' }),
    );
  });

  it('apiError no muestra toast cuando es Cookie not sent', () => {
    const normalized: ApiError = {
      httpStatus: 500,
      message: 'Cookie not sent',
      i18nKey: 'errors.server',
      original: null,
    };
    normalize.mockReturnValue(normalized);
    isCookieNotSentError.mockReturnValue(true);

    const result = service.apiError(new Error('Cookie not sent'));

    expect(result).toBe(normalized);
    expect(isCookieNotSentError).toHaveBeenCalledWith(normalized);
    expect(messageAdd).not.toHaveBeenCalled();
  });

  it('no hace nada en SSR', () => {
    TestBed.resetTestingModule();
    configure('server');

    service.error('errors.generic');
    service.success('toast.ok');

    expect(messageAdd).not.toHaveBeenCalled();
  });
});
