import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GoogleAuthService } from './google-auth.service';

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;
  let initialize: jest.Mock;
  let renderButton: jest.Mock;

  beforeEach(() => {
    initialize = jest.fn();
    renderButton = jest.fn();
    window.google = {
      accounts: {
        id: {
          initialize,
          renderButton,
        },
      },
    };

    const existingScript = document.createElement('script');
    existingScript.id = 'gsi-script';
    document.head.appendChild(existingScript);

    TestBed.configureTestingModule({
      providers: [
        GoogleAuthService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(GoogleAuthService);
  });

  afterEach(() => {
    delete window.google;
    document.getElementById('gsi-script')?.remove();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('no debe renderizar botón si el elemento es nulo', () => {
    service.renderButton(null as unknown as HTMLElement);
    expect(initialize).not.toHaveBeenCalled();
  });

  it('debe inicializar Google y renderizar el botón', async () => {
    const element = document.createElement('div');

    service.renderButton(element, { text: 'signup_with', size: 'small' });

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        context: 'signup',
        use_fedcm_for_prompt: false,
        use_fedcm_for_button: false,
      }),
    );
    expect(renderButton).toHaveBeenCalledWith(
      element,
      expect.objectContaining({
        text: 'signup_with',
        size: 'small',
      }),
    );
  });

  it('debe emitir credential cuando el callback de Google se invoca', async () => {
    const element = document.createElement('div');
    const credentials: string[] = [];
    service.credential$.subscribe((c) => credentials.push(c));

    service.renderButton(element);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const config = initialize.mock.calls[0][0];
    config.callback({ credential: 'id-token-123' });

    expect(credentials).toEqual(['id-token-123']);
  });

  it('no debe hacer nada en entorno no-browser', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        GoogleAuthService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const ssrService = TestBed.inject(GoogleAuthService);
    const element = document.createElement('div');
    ssrService.renderButton(element);
    expect(initialize).not.toHaveBeenCalled();
  });

  it('debe resolver loadScript cuando el script ya existe', async () => {
    const element = document.createElement('div');
    service.renderButton(element);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(initialize).toHaveBeenCalled();
  });

  it('debe reutilizar script existente por id gsi-script', async () => {
    document.getElementById('gsi-script')?.remove();
    const existing = document.createElement('script');
    existing.id = 'gsi-script';
    document.head.appendChild(existing);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        GoogleAuthService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const fresh = TestBed.inject(GoogleAuthService);
    window.google = {
      accounts: { id: { initialize, renderButton } },
    };
    const element = document.createElement('div');
    fresh.renderButton(element);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(renderButton).toHaveBeenCalled();
  });

  it('debe cargar script cuando no existe gsi-script', async () => {
    document.getElementById('gsi-script')?.remove();
    delete window.google;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        GoogleAuthService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const fresh = TestBed.inject(GoogleAuthService);
    const element = document.createElement('div');
    const appendSpy = jest.spyOn(document.head, 'appendChild');

    fresh.renderButton(element);

    const script = appendSpy.mock.calls.find(
      (call) => (call[0] as HTMLScriptElement)?.id === 'gsi-script',
    )?.[0] as HTMLScriptElement | undefined;
    expect(script).toBeDefined();
    window.google = {
      accounts: { id: { initialize, renderButton } },
    };
    script?.onload?.(new Event('load'));
    await new Promise((resolve) => setTimeout(resolve, 50));
    appendSpy.mockRestore();
  });

  it('debe usar context signin por defecto', async () => {
    const element = document.createElement('div');
    service.renderButton(element);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ context: 'signin' }),
    );
  });
});
