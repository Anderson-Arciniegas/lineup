import { inject, Injectable } from '@angular/core';
import {
  CHANGE_PASSWORD_MUTATION,
  CREATE_USER_MUTATION,
  GET_ME_QUERY,
  GET_USER_BY_ID_QUERY,
  LOGIN_MUTATION,
  REFRESH_TOKEN_MUTATION,
  UPDATE_USER_MUTATION,
  USER_LOGOUT_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ChangePasswordInput,
  CreateUserInput,
  CreateUserResponse,
  UpdateUserInput,
} from '../models';
import { UserSchema } from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apollo = inject(Apollo);

  login(email: string, password: string): Observable<any> {
    return this.apollo
      .use('userAPI')
      .mutate<any>({
        mutation: LOGIN_MUTATION,
        variables: { login: { email, password } },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.login.user));
  }

  logOut(): Observable<any> {
    return this.apollo
      .use('userAPI')
      .mutate<any>({
        mutation: USER_LOGOUT_MUTATION,
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.logout.status));
  }

  getMe(): Observable<any> {
    return this.apollo
      .use('userAPI')
      .query<{ me: UserSchema }>({
        query: GET_ME_QUERY,
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.me));
  }

  createUser(data: CreateUserInput): Observable<any> {
    return this.apollo
      .use('userAPI')
      .mutate<CreateUserResponse>({
        mutation: CREATE_USER_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.createUser.user));
  }

  getUser(id: number): Observable<any> {
    return this.apollo
      .use('userAPI')
      .query<{ userById: UserSchema }>({
        query: GET_USER_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.userById));
  }

  refreshToken(): Observable<any> {
    return this.apollo
      .use('userAPI')
      .mutate<any>({
        mutation: REFRESH_TOKEN_MUTATION,
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.refreshToken.user));
  }

  updateUser(data: UpdateUserInput): Observable<UserSchema> {
    return this.apollo
      .use('userAPI')
      .mutate<{ updateUser: UserSchema }>({
        mutation: UPDATE_USER_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.updateUser));
  }

  changePassword(data: ChangePasswordInput): Observable<boolean> {
    return this.apollo
      .use('userAPI')
      .mutate<{ changePassword: boolean }>({
        mutation: CHANGE_PASSWORD_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.changePassword));
  }
}
