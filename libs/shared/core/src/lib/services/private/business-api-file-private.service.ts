import { HttpClient, HttpEvent } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@lineup/envs';
import { Observable } from 'rxjs';
import { skipGlobalErrorToastContext } from '../../constants';
import { ApiResponse } from '../../models/api-response.model';
import { FileResponse } from '../../models/file.model';

@Injectable({
  providedIn: 'root',
})
export class BusinessApiFilePrivateService {
  private _http = inject(HttpClient);

  /** Las vistas tratan el error de subida de forma específica: sin toast global. */
  post(
    path: string,
    body: FormData | { url: string },
  ): Observable<HttpEvent<FileResponse>> {
    return this._http.post<FileResponse>(
      `${environment.businessApiFile}${path}`,
      body,
      {
        reportProgress: true,
        observe: 'events',
        withCredentials: true,
        context: skipGlobalErrorToastContext(),
      },
    );
  }

  uploadImportDocument(file: File): Observable<HttpEvent<ApiResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this._http.post<ApiResponse>(
      `${environment.businessApiFile}files/upload-document`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
        withCredentials: true,
        context: skipGlobalErrorToastContext(),
      },
    );
  }
}
