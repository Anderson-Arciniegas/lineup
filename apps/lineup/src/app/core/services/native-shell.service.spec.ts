import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ImagePreviewBackService } from './image-preview-back.service';
import { NativeShellService } from './native-shell.service';

jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
  },
}));

jest.mock('@capacitor/app', () => ({
  App: {
    addListener: jest.fn(),
    exitApp: jest.fn(),
  },
}));

describe('NativeShellService', () => {
  let service: NativeShellService;
  let location: { back: jest.Mock };
  let remove: jest.Mock;
  let imagePreviewBack: { closeIfOpen: jest.Mock };

  beforeEach(() => {
    location = { back: jest.fn() };
    remove = jest.fn().mockResolvedValue(undefined);
    imagePreviewBack = { closeIfOpen: jest.fn(() => false) };
    (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(false);
    (App.addListener as jest.Mock).mockReset();
    (App.exitApp as jest.Mock).mockReset();
    (App.addListener as jest.Mock).mockResolvedValue({ remove });

    TestBed.configureTestingModule({
      providers: [
        { provide: Location, useValue: location },
        { provide: ImagePreviewBackService, useValue: imagePreviewBack },
      ],
    });
    service = TestBed.inject(NativeShellService);
  });

  it('no registra el botón atrás en el navegador', async () => {
    await service.attachBackButton();

    expect(App.addListener).not.toHaveBeenCalled();
  });

  it('retrocede en el historial cuando el WebView puede volver', async () => {
    (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(true);
    let onBack: (event: { canGoBack: boolean }) => void = () => undefined;
    (App.addListener as jest.Mock).mockImplementation(
      async (
        _event: string,
        handler: (event: { canGoBack: boolean }) => void,
      ) => {
        onBack = handler;
        return { remove };
      },
    );

    await service.attachBackButton();
    onBack({ canGoBack: true });

    expect(location.back).toHaveBeenCalled();
    expect(App.exitApp).not.toHaveBeenCalled();
  });

  it('cierra la app cuando no hay historial', async () => {
    (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(true);
    let onBack: (event: { canGoBack: boolean }) => void = () => undefined;
    (App.addListener as jest.Mock).mockImplementation(
      async (
        _event: string,
        handler: (event: { canGoBack: boolean }) => void,
      ) => {
        onBack = handler;
        return { remove };
      },
    );

    await service.attachBackButton();
    onBack({ canGoBack: false });

    expect(App.exitApp).toHaveBeenCalled();
    expect(location.back).not.toHaveBeenCalled();
  });

  it('cierra el preview de imagen antes de navegar', async () => {
    imagePreviewBack.closeIfOpen.mockReturnValue(true);
    (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(true);
    let onBack: (event: { canGoBack: boolean }) => void = () => undefined;
    (App.addListener as jest.Mock).mockImplementation(
      async (
        _event: string,
        handler: (event: { canGoBack: boolean }) => void,
      ) => {
        onBack = handler;
        return { remove };
      },
    );

    await service.attachBackButton();
    onBack({ canGoBack: true });

    expect(imagePreviewBack.closeIfOpen).toHaveBeenCalled();
    expect(location.back).not.toHaveBeenCalled();
    expect(App.exitApp).not.toHaveBeenCalled();
  });

  it('quita el listener al desconectar', async () => {
    (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(true);

    await service.attachBackButton();
    await service.detachBackButton();

    expect(remove).toHaveBeenCalled();
  });
});
