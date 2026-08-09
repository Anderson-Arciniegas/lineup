import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { UserNotificationsPublicService } from './user-notifications-public.service';

describe('UserNotificationsPublicService', () => {
  let service: UserNotificationsPublicService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"myNotifications":{"items":[],"total":0},"unreadNotificationsCount":3} as Record<string, unknown> }),
      mutate: () => of({ data: {"markAllNotificationsRead":true,"markNotificationRead":{"id":1}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [UserNotificationsPublicService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(UserNotificationsPublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('myNotifications calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.myNotifications({ limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('unreadNotificationsCount calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.unreadNotificationsCount());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('markAllNotificationsRead calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.markAllNotificationsRead());
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('markNotificationRead calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.markNotificationRead(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('markAllNotificationsRead throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(service.markAllNotificationsRead()),
    ).rejects.toThrow('No data returned from mutation');
  });

  it('markNotificationRead throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(service.markNotificationRead(1)),
    ).rejects.toThrow('No data returned from mutation');
  });
});
