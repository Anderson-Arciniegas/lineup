import { inject, Injectable } from '@angular/core';
import {
  FIND_ALL_BUSINESSES_QUERY,
  FIND_FOLLOWED_BUSINESSES_QUERY,
  FOLLOW_BUSINESS_MUTATION,
  GET_BUSINESS_BY_PATH,
  FIND_ONE_BUSINESS_QUERY,
  IS_FOLLOWING_BUSINESS_QUERY,
  UNFOLLOW_BUSINESS_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { InfinityScrollInput, PaginatedBusinesses } from '../../models';
import { BusinessFollowerSchema, BusinessSchema } from '../../schemas';

@Injectable({
  providedIn: 'root',
})
export class BusinessPublicService {
  private apollo = inject(Apollo);

  findAllBusinesses(
    pagination: InfinityScrollInput
  ): Observable<PaginatedBusinesses> {
    return this.apollo
      .use('userAPI')
      .query<{ findAllBusinesses: PaginatedBusinesses }>({
        query: FIND_ALL_BUSINESSES_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findAllBusinesses));
  }

  findBusinessByPath(path: string): Observable<BusinessSchema> {
    return this.apollo
      .use('userAPI')
      .query<{ findBusinessByPath: BusinessSchema }>({
        query: GET_BUSINESS_BY_PATH,
        variables: { path },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findBusinessByPath));
  }

  findFollowedBusinesses(
    pagination: InfinityScrollInput
  ): Observable<PaginatedBusinesses> {
    return this.apollo
      .use('userAPI')
      .query<{ findFollowedBusinesses: PaginatedBusinesses }>({
        query: FIND_FOLLOWED_BUSINESSES_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findFollowedBusinesses));
  }

  findOneBusiness(id: number): Observable<BusinessSchema> {
    return this.apollo
      .use('userAPI')
      .query<{ findOneBusiness: BusinessSchema }>({
        query: FIND_ONE_BUSINESS_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findOneBusiness));
  }

  isFollowingBusiness(idBusiness: number): Observable<boolean> {
    return this.apollo
      .use('userAPI')
      .query<{ isFollowingBusiness: boolean }>({
        query: IS_FOLLOWING_BUSINESS_QUERY,
        variables: { idBusiness },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.isFollowingBusiness));
  }

  followBusiness(idBusiness: number): Observable<BusinessFollowerSchema> {
    return this.apollo
      .use('userAPI')
      .mutate<{ followBusiness: BusinessFollowerSchema }>({
        mutation: FOLLOW_BUSINESS_MUTATION,
        variables: { idBusiness },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.followBusiness));
  }

  unfollowBusiness(idBusiness: number): Observable<boolean> {
    return this.apollo
      .use('userAPI')
      .mutate<{ unfollowBusiness: boolean }>({
        mutation: UNFOLLOW_BUSINESS_MUTATION,
        variables: { idBusiness },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.unfollowBusiness));
  }
}
