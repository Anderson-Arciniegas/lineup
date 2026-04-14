import {
  HttpClient,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@lineup/envs';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface AdminUploadedFilePayload {
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminApiFileService {
  private readonly http = inject(HttpClient);

  /**
   * POST multipart a `files/upload` del API admin (mismo contrato que business/users).
   */
  upload(
    directory: string,
    file: File,
    filename: string,
  ): Observable<AdminUploadedFilePayload> {
    const form = new FormData();
    form.append('directory', directory);
    form.append('file', file, filename);
    return this.http
      .post<{ file: AdminUploadedFilePayload }>(
        `${environment.adminApiFile}files/upload`,
        form,
        {
          reportProgress: true,
          observe: 'events',
          withCredentials: true,
        },
      )
      .pipe(
        filter(
          (e): e is HttpResponse<{ file: AdminUploadedFilePayload }> =>
            e.type === HttpEventType.Response,
        ),
        map((e) => {
          const f = e.body?.file;
          if (!f?.name) {
            throw new Error('admin.fileUpload.invalidResponse');
          }
          return f;
        }),
      );
  }
}
