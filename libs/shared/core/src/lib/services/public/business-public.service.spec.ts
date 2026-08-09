import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { BusinessPublicService } from './business-public.service';

describe('BusinessPublicService', () => {
  let service: BusinessPublicService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"findAllBusinesses":{"items":[],"total":0},"findBusinessByPath":{"id":1},"findFollowedBusinesses":{"items":[],"total":0},"findOneBusiness":{"id":1},"isFollowingBusiness":true} as Record<string, unknown> }),
      mutate: () => of({ data: {"followBusiness":{"id":1},"unfollowBusiness":true} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [BusinessPublicService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(BusinessPublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAllBusinesses calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findAllBusinesses({ limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findBusinessByPath calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findBusinessByPath('biz'));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findFollowedBusinesses calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findFollowedBusinesses({ limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findOneBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findOneBusiness(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('isFollowingBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.isFollowingBusiness(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('followBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.followBusiness(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('unfollowBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.unfollowBusiness(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });
});
