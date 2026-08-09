import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { LocationsPrivateService } from './locations-private.service';

describe('LocationsPrivateService', () => {
  let service: LocationsPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"findAllMyLocations":[],"findOneLocation":{"id":1}} as Record<string, unknown> }),
      mutate: () => of({ data: {"createLocation":{"id":1},"updateLocation":{"id":1},"removeLocation":true} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [LocationsPrivateService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(LocationsPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAllMyLocations calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findAllMyLocations());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findOneLocation calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findOneLocation(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('createLocation calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.createLocation({ name: "Loc" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateLocation calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.updateLocation({ id: 1 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('removeLocation calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.removeLocation(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });
});
