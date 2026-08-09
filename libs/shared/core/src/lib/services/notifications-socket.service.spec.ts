import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NOTIFICATION_SOCKET_EVENT,
  NOTIFICATION_SOCKET_JOIN_EVENT,
} from '../constants/notifications-socket.constants';
import { NotificationsSocketService } from './notifications-socket.service';

const socketHandlers = new Map<string, (...args: unknown[]) => void>();

const mockSocket = {
  on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
    socketHandlers.set(event, handler);
  }),
  emit: jest.fn(),
  removeAllListeners: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}));

describe('NotificationsSocketService', () => {
  let service: NotificationsSocketService;

  beforeEach(() => {
    socketHandlers.clear();
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        NotificationsSocketService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(NotificationsSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts disconnected', () => {
    expect(service.connectionStatus()).toBe('disconnected');
    expect(service.isConnected()).toBe(false);
  });

  it('disconnect keeps status disconnected', () => {
    service.disconnect();
    expect(service.connectionStatus()).toBe('disconnected');
  });

  it('clearLastNotification resets last notification signal', () => {
    service.clearLastNotification();
    expect(service.lastNotification()).toBeNull();
  });

  it('connect with invalid entityId does not connect', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    await service.connect('user', 0);
    expect(service.connectionStatus()).toBe('disconnected');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('connect on server platform is no-op', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        NotificationsSocketService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const serverService = TestBed.inject(NotificationsSocketService);
    await serverService.connect('user', 1);
    expect(serverService.connectionStatus()).toBe('disconnected');
  });

  it('notification$ is defined', () => {
    expect(service.notification$).toBeDefined();
  });

  it('connect success path joins user room and handles events', async () => {
    const payload = { id: 1, title: 'Hi' };
    const received: unknown[] = [];
    service.notification$.subscribe((n) => received.push(n));

    await service.connect('user', 42);

    socketHandlers.get('connect')?.();
    expect(service.connectionStatus()).toBe('connected');
    expect(mockSocket.emit).toHaveBeenCalledWith(NOTIFICATION_SOCKET_JOIN_EVENT, {
      type: 'user',
      id: 42,
    });

    socketHandlers.get(NOTIFICATION_SOCKET_EVENT)?.(payload);
    expect(service.lastNotification()).toEqual(payload);
    expect(received).toEqual([payload]);

    socketHandlers.get('connect_error')?.();
    expect(service.connectionStatus()).toBe('error');

    socketHandlers.get('disconnect')?.();
    expect(service.connectionStatus()).toBe('disconnected');
  });

  it('connect success path joins business room', async () => {
    await service.connect('business', 7);
    socketHandlers.get('connect')?.();
    expect(mockSocket.emit).toHaveBeenCalledWith(NOTIFICATION_SOCKET_JOIN_EVENT, {
      type: 'business',
      id: 7,
    });
  });

  it('disconnect removes listeners and resets socket', async () => {
    await service.connect('user', 1);
    service.disconnect();
    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(service.connectionStatus()).toBe('disconnected');
  });

  it('ignores stale connection after disconnect', async () => {
    const connectPromise = service.connect('user', 1);
    service.disconnect();
    await connectPromise;
    expect(service.connectionStatus()).toBe('disconnected');
  });
});
