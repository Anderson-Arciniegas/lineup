import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { BusinessNotificationsPrivateService } from './business-notifications-private.service';

describe('BusinessNotificationsPrivateService', () => {
  let service: BusinessNotificationsPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"myBusinessNotifications":{"items":[],"total":0},"unreadBusinessNotificationsCount":2} as Record<string, unknown> }),
      mutate: () => of({ data: {"markAllBusinessNotificationsRead":true,"markBusinessNotificationRead":{"id":1}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [BusinessNotificationsPrivateService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(BusinessNotificationsPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('myBusinessNotifications calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.myBusinessNotifications({ limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('unreadBusinessNotificationsCount calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.unreadBusinessNotificationsCount());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('markAllBusinessNotificationsRead calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.markAllBusinessNotificationsRead());
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('markBusinessNotificationRead calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.markBusinessNotificationRead(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('markAllBusinessNotificationsRead throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(service.markAllBusinessNotificationsRead()),
    ).rejects.toThrow('No data returned from mutation');
  });

  it('markBusinessNotificationRead throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(service.markBusinessNotificationRead(1)),
    ).rejects.toThrow('No data returned from mutation');
  });
});
