import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { SocialNetworkPrivateService } from './social-network-private.service';

describe('SocialNetworkPrivateService', () => {
  let service: SocialNetworkPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"findAllSocialNetworks":[],"findAllMySocialNetworkBusinesses":[],"findByBusiness":[]} as Record<string, unknown> }),
      mutate: () => of({ data: {"createSocialNetworkBusiness":{"id":1},"updateSocialNetworkBusiness":{"id":1},"removeSocialNetworkBusiness":true} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [SocialNetworkPrivateService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(SocialNetworkPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getSocialNetworks calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getSocialNetworks());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findAllMySocialNetworkBusinesses calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findAllMySocialNetworkBusinesses());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findByBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findByBusiness(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('createSocialNetworkBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.createSocialNetworkBusiness({ idSocialNetwork: 1 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateSocialNetworkBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.updateSocialNetworkBusiness({ id: 1 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('removeSocialNetworkBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.removeSocialNetworkBusiness(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('createSocialNetworkBusiness throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(
        service.createSocialNetworkBusiness({ idSocialNetwork: 1 } as never),
      ),
    ).rejects.toThrow('No data returned from mutation');
  });

  it('updateSocialNetworkBusiness throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(service.updateSocialNetworkBusiness({ id: 1 } as never)),
    ).rejects.toThrow('No data returned from mutation');
  });

  it('removeSocialNetworkBusiness throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(service.removeSocialNetworkBusiness(1)),
    ).rejects.toThrow('No data returned from mutation');
  });
});
