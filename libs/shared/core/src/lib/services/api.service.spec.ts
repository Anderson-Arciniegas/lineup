import { HttpParams } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Params, Router, UrlSerializer } from '@angular/router';
import { environment } from '@lineup/envs';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let router: jest.Mocked<Pick<Router, 'createUrlTree'>>;
  let serializer: jest.Mocked<Pick<UrlSerializer, 'serialize'>>;

  beforeEach(() => {
    router = { createUrlTree: jest.fn() };
    serializer = { serialize: jest.fn().mockReturnValue('/path?q=1') };

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: UrlSerializer, useValue: serializer },
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get performs HTTP GET', () => {
    service.get('/users').subscribe((data) => {
      expect(data).toEqual({ ok: true });
    });
    const req = httpMock.expectOne(`${environment.userApi}/users`);
    expect(req.request.method).toBe('GET');
    req.flush({ ok: true });
  });

  it('get with noCache adds timestamp param', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    service.get('/users', { q: '1' }, true).subscribe();
    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.userApi}/users` &&
        r.params.get('q') === '1' &&
        r.params.get('timestamp') === '1234567890',
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
    jest.restoreAllMocks();
  });

  it('get accepts HttpParams instance', () => {
    const params = new HttpParams().set('page', '1');
    service.get('/users', params).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.userApi}/users` && r.params.get('page') === '1',
    );
    req.flush({});
  });

  it('put performs HTTP PUT', () => {
    service.put('/users/1', { name: 'a' }).subscribe();
    const req = httpMock.expectOne(`${environment.userApi}/users/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('post performs HTTP POST', () => {
    service.post('/users', { name: 'a' }).subscribe();
    const req = httpMock.expectOne(`${environment.userApi}/users`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('delete performs HTTP DELETE', () => {
    service.delete('/users/1').subscribe();
    const req = httpMock.expectOne(`${environment.userApi}/users/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('patch performs HTTP PATCH', () => {
    service.patch('/users/1', { name: 'a' }).subscribe();
    const req = httpMock.expectOne(`${environment.userApi}/users/1`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('buildQueryString serializes router url tree', () => {
    const params: Params = { q: '1' };
    const result = service.buildQueryString(['path'], params);
    expect(router.createUrlTree).toHaveBeenCalledWith(['path'], {
      queryParams: params,
    });
    expect(result).toBe('path?q=1');
  });
});
