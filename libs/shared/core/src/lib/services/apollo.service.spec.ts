import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloService } from './apollo.service';

describe('ApolloService', () => {
  let service: ApolloService;
  let apolloCreate: jest.Mock;
  let httpLinkCreate: jest.Mock;

  beforeEach(() => {
    apolloCreate = jest.fn();
    httpLinkCreate = jest.fn().mockReturnValue({});

    TestBed.configureTestingModule({
      providers: [
        ApolloService,
        { provide: Apollo, useValue: { create: apolloCreate } },
        { provide: HttpLink, useValue: { create: httpLinkCreate } },
      ],
    });
    service = TestBed.inject(ApolloService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initializeApollo creates client with http link', () => {
    service.initializeApollo('https://api.example/graphql');
    expect(httpLinkCreate).toHaveBeenCalledWith({
      uri: 'https://api.example/graphql',
    });
    expect(apolloCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        link: expect.anything(),
        cache: expect.anything(),
      }),
    );
  });
});
