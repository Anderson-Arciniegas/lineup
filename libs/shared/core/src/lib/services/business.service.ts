import { inject, Injectable } from '@angular/core';
import {
  BUSINESS_LOGIN_MUTATION,
  BUSINESS_LOGIN_WITH_GOOGLE_MUTATION,
  BUSINESS_LOGOUT_MUTATION,
  BUSINESS_REFRESH_TOKEN_MUTATION,
  BUSINESS_REGISTER_WITH_GOOGLE_MUTATION,
  CHANGE_BUSINESS_PASSWORD_MUTATION,
  CREATE_BUSINESS_MUTATION,
  GET_BUSINESS_BY_PATH,
  GET_MY_BUSINESS_QUERY,
  UPDATE_BUSINESS_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CreateBusinessInput,
  CreateBusinessResponse,
  RegisterGoogleBusinessInput,
  UpdateBusinessInput,
} from '../models/business.model';
import { ChangePasswordInput, LoginGoogleInput, LoginResponse } from '../models/user.model';
import { BusinessSchema } from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private apollo = inject(Apollo);

  login(email: string, password: string): Observable<any> {
    return this.apollo
      .use('businessAPI')
      .mutate<any>({
        mutation: BUSINESS_LOGIN_MUTATION,
        variables: { login: { email, password } },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.login.business));
  }

  logOut(): Observable<any> {
    return this.apollo
      .use('businessAPI')
      .mutate<any>({
        mutation: BUSINESS_LOGOUT_MUTATION,
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.logout.status));
  }

  myBusiness(): Observable<any> {
    return this.apollo
      .use('businessAPI')
      .query<{ myBusiness: BusinessSchema }>({
        query: GET_MY_BUSINESS_QUERY,
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.myBusiness));
  }

  createBusiness(data: CreateBusinessInput): Observable<any> {
    return this.apollo
      .use('businessAPI')
      .mutate<CreateBusinessResponse>({
        mutation: CREATE_BUSINESS_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.createBusiness.business));
  }

  refreshToken(): Observable<any> {
    return this.apollo
      .use('businessAPI')
      .mutate<any>({
        mutation: BUSINESS_REFRESH_TOKEN_MUTATION,
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.refreshToken.business));
  }

  updateBusiness(data: UpdateBusinessInput): Observable<any> {
    return this.apollo
      .use('businessAPI')
      .mutate<any>({
        mutation: UPDATE_BUSINESS_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.updateBusiness));
  }

  getBusinessByPath(path: string): Observable<any> {
    return this.apollo
      .use('businessAPI')
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

  changeBusinessPassword(data: ChangePasswordInput): Observable<boolean> {
    return this.apollo
      .use('businessAPI')
      .mutate<{ changeBusinessPassword: boolean }>({
        mutation: CHANGE_BUSINESS_PASSWORD_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.changeBusinessPassword));
  }

  loginWithGoogle(data: LoginGoogleInput): Observable<LoginResponse> {
    return this.apollo
      .use('businessAPI')
      .mutate<{ loginWithGoogle: LoginResponse }>({
        mutation: BUSINESS_LOGIN_WITH_GOOGLE_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.loginWithGoogle));
  }

  registerWithGoogle(data: RegisterGoogleBusinessInput): Observable<LoginResponse> {
    return this.apollo
      .use('businessAPI')
      .mutate<{ registerWithGoogle: LoginResponse }>({
        mutation: BUSINESS_REGISTER_WITH_GOOGLE_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.registerWithGoogle));
  }

  //   getUser(id: number): Observable<any> {
  //     return this.apollo
  //       .use('businessAPI')
  //       .query<{ userById: UserSchema }>({
  //         query: GET_USER_QUERY,
  //         variables: { id },
  //         fetchPolicy: 'network-only',
  //         context: {
  //           withCredentials: true,
  //         },
  //       })
  //       .pipe(map((result) => result.data.userById));
  //   }

  // Si usas una API secundaria, especifica el cliente:
  // this.apollo.use('secondaryAPI').mutate(...)
}
