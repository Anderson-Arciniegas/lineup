import { inject, Injectable } from '@angular/core';

import {
  CREATE_SOCIAL_NETWORK_BUSINESS_MUTATION,
  GET_MY_SOCIAL_NETWORK_BUSINESSES_QUERY,
  GET_SOCIAL_NETWORKS_QUERY,
  REMOVE_SOCIAL_NETWORK_BUSINESS_MUTATION,
  UPDATE_SOCIAL_NETWORK_BUSINESS_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from '.';
import {
  CreateSocialNetworkBusinessInput,
  UpdateSocialNetworkBusinessInput,
} from '../models/social-network-business.model';
import {
  SocialNetworkBusinessSchema,
  SocialNetworkSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class SocialNetworkService {
  private apollo = inject(Apollo);

 

  getSocialNetworks(): Observable<SocialNetworkSchema[]> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findAllSocialNetworks: SocialNetworkSchema[] }>({
        query: GET_SOCIAL_NETWORKS_QUERY,
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findAllSocialNetworks));
  }

  findAllMySocialNetworkBusinesses(): Observable<
    SocialNetworkBusinessSchema[]
  > {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findAllMySocialNetworkBusinesses: SocialNetworkBusinessSchema[] }>(
        {
          query: GET_MY_SOCIAL_NETWORK_BUSINESSES_QUERY,
          fetchPolicy: 'network-only',
          context: {
            withCredentials: true,
          },
        },
      )
      .pipe(map((result) => result.data.findAllMySocialNetworkBusinesses));
  }

  createSocialNetworkBusiness(
    data: CreateSocialNetworkBusinessInput,
  ): Observable<SocialNetworkBusinessSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ createSocialNetworkBusiness: SocialNetworkBusinessSchema }>({
        mutation: CREATE_SOCIAL_NETWORK_BUSINESS_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.createSocialNetworkBusiness;
        }),
      );
  }

  updateSocialNetworkBusiness(
    data: UpdateSocialNetworkBusinessInput,
  ): Observable<SocialNetworkBusinessSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ updateSocialNetworkBusiness: SocialNetworkBusinessSchema }>({
        mutation: UPDATE_SOCIAL_NETWORK_BUSINESS_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.updateSocialNetworkBusiness;
        }),
      );
  }

  removeSocialNetworkBusiness(id: number): Observable<boolean> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ removeSocialNetworkBusiness: boolean }>({
        mutation: REMOVE_SOCIAL_NETWORK_BUSINESS_MUTATION,
        variables: { id },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.removeSocialNetworkBusiness;
        }),
      );
  }
}