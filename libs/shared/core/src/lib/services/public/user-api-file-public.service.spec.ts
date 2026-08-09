import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@lineup/envs';
import { UserApiFilePublicService } from './user-api-file-public.service';

describe('UserApiFilePublicService', () => {
  let service: UserApiFilePublicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserApiFilePublicService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserApiFilePublicService);
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
    const req = httpMock.expectOne(`${environment.userApiFile}/upload`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });
});
