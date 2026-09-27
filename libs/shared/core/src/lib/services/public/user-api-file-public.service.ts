import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@lineup/envs';
import { Observable } from 'rxjs';
import { skipGlobalErrorToastContext } from '../../constants';

@Injectable({
  providedIn: 'root',
})
export class UserApiFilePublicService {
  private _http = inject(HttpClient);

  /** Las vistas tratan el error de subida de forma específica: sin toast global. */
  post(path: string, body: FormData | { url: string }): Observable<any> {
    return this._http.post(`${environment.userApiFile}${path}`, body, {
      reportProgress: true,
      observe: 'events',
      withCredentials: true,
      context: skipGlobalErrorToastContext(),
    });
  }
}
