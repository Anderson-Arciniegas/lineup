import { inject, Injectable } from '@angular/core';
import type { SocialNetworkSchema } from '@lineup/core';
import { type CreateSocialNetworkInput, type UpdateSocialNetworkInput } from '../schemas';
import { ADMIN_APOLLO_CLIENT } from '../constants/admin-apollo-client';
import {
  ADMIN_CREATE_SOCIAL_NETWORK_MUTATION,
  ADMIN_REMOVE_SOCIAL_NETWORK_MUTATION,
  ADMIN_UPDATE_SOCIAL_NETWORK_MUTATION,
} from '../graphql/mutations/admin-social-networks.mutations';
import {
  ADMIN_FIND_ALL_SOCIAL_NETWORKS_QUERY,
  ADMIN_FIND_SOCIAL_NETWORK_BY_CODE_QUERY,
  ADMIN_FIND_SOCIAL_NETWORK_BY_ID_QUERY,
} from '../graphql/queries/admin-social-networks.queries';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SocialNetworkAdminService {
  private readonly apollo = inject(Apollo);

  findAllSocialNetworks(): Observable<SocialNetworkSchema[]> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ findAllSocialNetworks: SocialNetworkSchema[] }>({
        query: ADMIN_FIND_ALL_SOCIAL_NETWORKS_QUERY,
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.findAllSocialNetworks));
  }

  findSocialNetworkByCode(code: string): Observable<SocialNetworkSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ findSocialNetworkByCode: SocialNetworkSchema }>({
        query: ADMIN_FIND_SOCIAL_NETWORK_BY_CODE_QUERY,
        variables: { code },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.findSocialNetworkByCode));
  }

  findSocialNetworkById(id: number): Observable<SocialNetworkSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ findSocialNetworkById: SocialNetworkSchema }>({
        query: ADMIN_FIND_SOCIAL_NETWORK_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.findSocialNetworkById));
  }

  createSocialNetwork(
    data: CreateSocialNetworkInput,
  ): Observable<SocialNetworkSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ createSocialNetwork: SocialNetworkSchema }>({
        mutation: ADMIN_CREATE_SOCIAL_NETWORK_MUTATION,
        variables: { data },
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.createSocialNetwork));
  }

  updateSocialNetwork(
    data: UpdateSocialNetworkInput,
  ): Observable<SocialNetworkSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ updateSocialNetwork: SocialNetworkSchema }>({
        mutation: ADMIN_UPDATE_SOCIAL_NETWORK_MUTATION,
        variables: { data },
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.updateSocialNetwork));
  }

  removeSocialNetwork(id: number): Observable<boolean> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ removeSocialNetwork: boolean }>({
        mutation: ADMIN_REMOVE_SOCIAL_NETWORK_MUTATION,
        variables: { id },
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.removeSocialNetwork));
  }
}
