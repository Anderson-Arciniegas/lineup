import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '@lineup/envs';

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private endpoints = {
    business: environments.apiBusiness,
    admin: environments.apiAdmin,
    user: environments.apiUser
  };

  constructor(private http: HttpClient) {}

  // Simple HTTP-based GraphQL call that includes cookies (withCredentials)
  request(endpointKey: 'business' | 'admin' | 'user', query: string, variables?: Record<string, unknown> | undefined) {
    const url = this.endpoints[endpointKey];
    return this.http.post(url, { query, variables }, { withCredentials: true });
  }
}
