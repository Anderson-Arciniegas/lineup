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

  it('uploadImportDocument posts the document with credentials', () => {
    const file = new File(['title,description'], 'products.csv', {
      type: 'text/csv',
    });

    service.uploadImportDocument(file).subscribe();

    const req = httpMock.expectOne(
      `${environment.businessApiFile}files/upload-document`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.reportProgress).toBe(true);
    expect(req.request.body).toBeInstanceOf(FormData);
    expect((req.request.body as FormData).get('file')).toBe(file);
    expect(req.request.headers.has('Content-Type')).toBe(false);
    req.flush({ code: 710100, status: true });
  });
});
