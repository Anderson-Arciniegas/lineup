import { inject, Injectable } from '@angular/core';
import type { RoleSchema } from '@lineup/core';
import {
  type AssignRoleToBusinessInput,
  type AssignRoleToUserInput,
  type RemoveRoleFromBusinessInput,
  type RemoveRoleFromUserInput,
} from '../schemas';
import { ADMIN_APOLLO_CLIENT } from '../constants/admin-apollo-client';
import {
  ADMIN_ASSIGN_ROLE_TO_BUSINESS_MUTATION,
  ADMIN_ASSIGN_ROLE_TO_USER_MUTATION,
  ADMIN_REMOVE_ROLE_FROM_BUSINESS_MUTATION,
  ADMIN_REMOVE_ROLE_FROM_USER_MUTATION,
} from '../graphql/mutations/admin-roles.mutations';
import {
  ADMIN_GET_ALL_ROLES_QUERY,
  ADMIN_GET_ROLES_BY_BUSINESS_QUERY,
  ADMIN_GET_ROLES_BY_USER_QUERY,
} from '../graphql/queries/admin-roles.queries';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RolesAdminService {
  private readonly apollo = inject(Apollo);

  getAllRoles(): Observable<RoleSchema[]> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ getAllRoles: RoleSchema[] }>({
        query: ADMIN_GET_ALL_ROLES_QUERY,
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.getAllRoles));
  }

  getRolesByBusiness(idBusiness: number): Observable<RoleSchema[]> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ getRolesByBusiness: RoleSchema[] }>({
        query: ADMIN_GET_ROLES_BY_BUSINESS_QUERY,
        variables: { idBusiness },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.getRolesByBusiness));
  }

  getRolesByUser(idUser: number): Observable<RoleSchema[]> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ getRolesByUser: RoleSchema[] }>({
        query: ADMIN_GET_ROLES_BY_USER_QUERY,
        variables: { idUser },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.getRolesByUser));
  }

  assignRoleToBusiness(data: AssignRoleToBusinessInput): Observable<RoleSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ assignRoleToBusiness: RoleSchema }>({
        mutation: ADMIN_ASSIGN_ROLE_TO_BUSINESS_MUTATION,
        variables: { data },
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.assignRoleToBusiness));
  }

  assignRoleToUser(data: AssignRoleToUserInput): Observable<RoleSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ assignRoleToUser: RoleSchema }>({
        mutation: ADMIN_ASSIGN_ROLE_TO_USER_MUTATION,
        variables: { data },
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.assignRoleToUser));
  }

  removeRoleFromBusiness(
    data: RemoveRoleFromBusinessInput,
  ): Observable<boolean> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ removeRoleFromBusiness: boolean }>({
        mutation: ADMIN_REMOVE_ROLE_FROM_BUSINESS_MUTATION,
        variables: { data },
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.removeRoleFromBusiness));
  }

  removeRoleFromUser(data: RemoveRoleFromUserInput): Observable<boolean> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ removeRoleFromUser: boolean }>({
        mutation: ADMIN_REMOVE_ROLE_FROM_USER_MUTATION,
        variables: { data },
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.removeRoleFromUser));
  }
}
