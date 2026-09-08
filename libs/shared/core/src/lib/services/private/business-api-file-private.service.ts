import { HttpClient, HttpEvent } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@lineup/envs';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { FileResponse } from '../../models/file.model';

@Injectable({
  providedIn: 'root',
})
export class BusinessApiFilePrivateService {
  private _http = inject(HttpClient);

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
      },
    );
  }
}
