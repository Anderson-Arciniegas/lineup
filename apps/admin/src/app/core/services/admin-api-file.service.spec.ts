import {
  HttpClient,
  HttpEventType,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@lineup/envs';
import { AdminApiFileService } from './admin-api-file.service';

describe('AdminApiFileService', () => {
  let service: AdminApiFileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminApiFileService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminApiFileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('upload posts multipart and returns file payload', () => {
    const file = new File(['content'], 'image.png', { type: 'image/png' });
    let result: { name: string; url: string } | undefined;

    service.upload('business', file, 'image.png').subscribe((r) => {
      result = r;
    });

    const req = httpMock.expectOne(`${environment.adminApiFile}files/upload`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.event({
      type: HttpEventType.Response,
      body: { file: { name: 'abc', url: 'https://cdn/abc.png' } },
    } as never);

    expect(result).toEqual({ name: 'abc', url: 'https://cdn/abc.png' });
  });

  it('upload throws when response body is invalid', () => {
    const file = new File(['content'], 'image.png', { type: 'image/png' });
    let error: Error | undefined;

    service.upload('business', file, 'image.png').subscribe({
      error: (e) => {
        error = e as Error;
      },
    });

    const req = httpMock.expectOne(`${environment.adminApiFile}files/upload`);
    req.event({
      type: HttpEventType.Response,
      body: { file: { name: '', url: '' } },
    } as never);

    expect(error?.message).toBe('admin.fileUpload.invalidResponse');
  });
});
