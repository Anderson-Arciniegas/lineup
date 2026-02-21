import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@lineup/envs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserApiFileService {
  private _http = inject(HttpClient);

  post(path: string, body: FormData | { url: string }): Observable<any> {
    return this._http.post(`${environment.userApiFile}${path}`, body, {
      reportProgress: true,
      observe: 'events',
      withCredentials: true,
    });
  }
}
