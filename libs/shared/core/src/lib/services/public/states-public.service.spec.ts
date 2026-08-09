import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { StatesPublicService } from './states-public.service';

describe('StatesPublicService', () => {
  let service: StatesPublicService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"findAllStates":[]} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [StatesPublicService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(StatesPublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAllStates calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findAllStates());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });
});
