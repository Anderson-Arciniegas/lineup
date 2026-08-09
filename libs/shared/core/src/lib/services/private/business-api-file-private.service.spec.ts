import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@lineup/envs';
import { BusinessApiFilePrivateService } from './business-api-file-private.service';

describe('BusinessApiFilePrivateService', () => {
  let service: BusinessApiFilePrivateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BusinessApiFilePrivateService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(BusinessApiFilePrivateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('post uploads file data', () => {
    const body = new FormData();
    service.post('/upload', body).subscribe();
    const req = httpMock.expectOne(`${environment.businessApiFile}/upload`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });
});
