import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { SocialNetworkAdminService } from './social-network-admin.service';

describe('SocialNetworkAdminService', () => {
  let service: SocialNetworkAdminService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () =>
        of({
          data: {
            findAllSocialNetworks: [],
            findSocialNetworkByCode: { id: 1 },
            findSocialNetworkById: { id: 1 },
          },
        }),
      mutate: () =>
        of({
          data: {
            createSocialNetwork: { id: 1 },
            updateSocialNetwork: { id: 1 },
            removeSocialNetwork: true,
          },
        }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [
        SocialNetworkAdminService,
        { provide: Apollo, useValue: apollo.mock },
      ],
    });
    service = TestBed.inject(SocialNetworkAdminService);
  });

  it('findAllSocialNetworks calls Apollo', async () => {
    await firstValueFrom(service.findAllSocialNetworks());
    expect(querySpy).toHaveBeenCalled();
  });

  it('findSocialNetworkByCode calls Apollo', async () => {
    await firstValueFrom(service.findSocialNetworkByCode('FB'));
    expect(querySpy).toHaveBeenCalled();
  });

  it('findSocialNetworkById calls Apollo', async () => {
    await firstValueFrom(service.findSocialNetworkById(1));
    expect(querySpy).toHaveBeenCalled();
  });

  it('createSocialNetwork calls Apollo', async () => {
    await firstValueFrom(
      service.createSocialNetwork({ name: 'FB', code: 'FB', imageCode: 'x' }),
    );
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateSocialNetwork calls Apollo', async () => {
    await firstValueFrom(service.updateSocialNetwork({ id: 1, name: 'FB' }));
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('removeSocialNetwork calls Apollo', async () => {
    await firstValueFrom(service.removeSocialNetwork(1));
    expect(mutateSpy).toHaveBeenCalled();
  });
});
