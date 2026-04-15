import { inject, Injectable } from '@angular/core';
import type { InfinityScrollInput } from '@lineup/core';
import type { UserSchema } from '@lineup/core';
import {
  type CreateUserAdminInput,
  type PaginatedUsersSchema,
  type UpdateUserAdminInput,
} from '../schemas';
import { ADMIN_APOLLO_CLIENT } from '../constants/admin-apollo-client';
import {
  ADMIN_CREATE_USER_MUTATION,
  ADMIN_REMOVE_USER_MUTATION,
  ADMIN_UPDATE_USER_MUTATION,
} from '../graphql/mutations/admin-users.mutations';
import {
  ADMIN_FIND_ALL_USERS_QUERY,
  ADMIN_FIND_ONE_USER_QUERY,
} from '../graphql/queries/admin-users.queries';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UsersAdminService {
  private readonly apollo = inject(Apollo);

  findAllUsers(
    pagination: InfinityScrollInput,
  ): Observable<PaginatedUsersSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ findAllUsers: PaginatedUsersSchema }>({
        query: ADMIN_FIND_ALL_USERS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.findAllUsers));
  }

  findOneUser(id: number): Observable<UserSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ findOneUser: UserSchema }>({
        query: ADMIN_FIND_ONE_USER_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.findOneUser));
  }

  createUser(data: CreateUserAdminInput): Observable<UserSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ createUser: UserSchema }>({
        mutation: ADMIN_CREATE_USER_MUTATION,
        variables: { data },
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.createUser));
  }

  updateUser(data: UpdateUserAdminInput): Observable<UserSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ updateUser: UserSchema }>({
        mutation: ADMIN_UPDATE_USER_MUTATION,
        variables: { data },
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.updateUser));
  }

  removeUser(id: number): Observable<boolean> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ removeUser: boolean }>({
        mutation: ADMIN_REMOVE_USER_MUTATION,
        variables: { id },
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.removeUser));
  }
}
