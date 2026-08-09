import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastNavigateService } from './toast-navigate.service';

describe('ToastNavigateService', () => {
  let service: ToastNavigateService;
  let messageAdd: jest.Mock;
  let navigate: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    messageAdd = jest.fn();
    navigate = jest.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        ToastNavigateService,
        { provide: MessageService, useValue: { add: messageAdd } },
        { provide: Router, useValue: { navigate } },
      ],
    });

    service = TestBed.inject(ToastNavigateService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe mostrar toast inmediatamente y navegar tras el retraso', () => {
    const message = {
      severity: 'success' as const,
      summary: 'OK',
      detail: 'Done',
    };

    service.showAndNavigate(message, ['/dashboard']);

    expect(messageAdd).toHaveBeenCalledWith(message);
    expect(navigate).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);

    expect(navigate).toHaveBeenCalledWith(['/dashboard'], undefined);
  });

  it('debe pasar NavigationExtras al router', () => {
    const extras = { queryParams: { tab: 'sales' } };
    service.showAndNavigate(
      { severity: 'info', summary: 'Info' },
      ['/stats'],
      extras,
    );

    jest.advanceTimersByTime(200);

    expect(navigate).toHaveBeenCalledWith(['/stats'], extras);
  });
});
