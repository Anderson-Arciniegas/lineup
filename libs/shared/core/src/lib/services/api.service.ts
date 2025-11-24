import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Params, Router, UrlSerializer, UrlTree } from '@angular/router';
import { environments } from '@lineup/envs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _router = inject(Router);
  private _serializer = inject(UrlSerializer);
  private _http = inject(HttpClient);

  get(
    path?: string,
    params?: HttpParams | Params,
    noCache?: boolean,
  ): Observable<any> {
    let httpParams =
      params instanceof HttpParams
        ? params
        : new HttpParams({ fromObject: params });
    if (noCache) {
      httpParams = httpParams.set('timestamp', Date.now().toString());
    }
    const url = environments.apiUser;

    return this._http.get(`${url}${path}`, {
      params: httpParams,
      ...this._options(),
    });
  }

  put<T = any>(path: string, body: object = {}): Observable<T> {
    const url = environments.apiUser;
    return this._http.put<T>(
      `${url}${path}`,
      JSON.stringify(body),
      this._options(),
    );
  }

  post<T = any>(path: string, body: object = {}): Observable<T> {
    const url = environments.apiUser;
    return this._http.post<T>(
      `${url}${path}`,
      JSON.stringify(body),
      this._options(),
    );
  }

  delete<T = any>(path: string): Observable<T> {
    const url = environments.apiUser;
    return this._http.delete<T>(`${url}${path}`, this._options());
  }

  patch<T = any>(path: string, body: object = {}): Observable<T> {
    const url = environments.apiUser;
    return this._http.patch<T>(
      `${url}${path}`,
      JSON.stringify(body),
      this._options(),
    );
  }

  /**
   * Build http request query params
   *
   * @param {string[]} uri
   * @param {Params} params
   * @returns {string}
   * @memberof ApiService
   */
  buildQueryString(uri: string[], params: Params): string {
    const tree: UrlTree = this._router.createUrlTree(uri, {
      queryParams: params,
    });
    const url: string = this._serializer.serialize(tree);
    return url.slice(1, url.length);
  }

  private _options() {
    return { headers: this.headers, withCredentials: true };
  }
}
