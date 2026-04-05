import { inject, Injectable } from '@angular/core';
import {
  CHANGE_PASSWORD_MUTATION,
  CREATE_USER_MUTATION,
  GET_ME_QUERY,
  GET_USER_BY_ID_QUERY,
  LOGIN_MUTATION,
  LOGIN_WITH_GOOGLE_MUTATION,
  RECORD_VISIT_MUTATION,
  REFRESH_TOKEN_MUTATION,
  REGISTER_WITH_GOOGLE_MUTATION,
  SEARCH_QUERY,
  UPDATE_USER_EMAIL_MUTATION,
  UPDATE_USER_MUTATION,
  USER_LOGOUT_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchTargetEnum } from '../../enums';
import {
  ChangePasswordInput,
  CreateUserInput,
  CreateUserResponse,
  LoginGoogleInput,
  RecordVisitInput,
  RegisterGoogleInput,
  UpdateUserEmailInput,
  UpdateUserInput,
} from '../../models';
import type {
  InfinityScrollInput,
  LoginResponse,
  PaginatedSearchResults,
  ProductSearchFiltersInput,
  SearchResultItem,
} from '../../models';
import { UserSchema } from '../../schemas';

@Injectable({
  providedIn: 'root',
})
export class UserPublicService {
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

  updateUserEmail(data: UpdateUserEmailInput): Observable<UserSchema> {
    return this.apollo
      .use('userAPI')
      .mutate<{ updateUserEmail: UserSchema }>({
        mutation: UPDATE_USER_EMAIL_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.updateUserEmail));
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

  recordVisit(input: RecordVisitInput): Observable<boolean> {
    return this.apollo
      .use('userAPI')
      .mutate<{ recordVisit: boolean }>({
        mutation: RECORD_VISIT_MUTATION,
        variables: { input },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.recordVisit));
  }

  search(
    pagination: InfinityScrollInput,
    target: SearchTargetEnum,
    productFilters?: ProductSearchFiltersInput | null
  ): Observable<PaginatedSearchResults> {
    const compact = this.compactProductFilters(productFilters);
    return this.apollo
      .use('userAPI')
      .query<{ search: PaginatedSearchResults }>({
        query: SEARCH_QUERY,
        variables: {
          pagination,
          target,
          ...(compact ? { productFilters: compact } : {}),
        },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          const data = result.data.search;
          const normalizedItems = data.items.map((item) =>
            this.normalizeSearchItem(item as unknown as Record<string, unknown>)
          ) as PaginatedSearchResults['items'];
          return { ...data, items: normalizedItems };
        })
      );
  }

  registerWithGoogle(data: RegisterGoogleInput): Observable<LoginResponse> {
    return this.apollo
      .use('userAPI')
      .mutate<{ registerWithGoogle: LoginResponse }>({
        mutation: REGISTER_WITH_GOOGLE_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.registerWithGoogle));
  }

  loginWithGoogle(data: LoginGoogleInput): Observable<LoginResponse> {
    return this.apollo
      .use('userAPI')
      .mutate<{ loginWithGoogle: LoginResponse }>({
        mutation: LOGIN_WITH_GOOGLE_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.loginWithGoogle));
  }

  private compactProductFilters(
    filters?: ProductSearchFiltersInput | null
  ): ProductSearchFiltersInput | undefined {
    if (!filters) {
      return undefined;
    }
    const out: ProductSearchFiltersInput = {};
    if (filters.location != null && filters.location !== '') {
      out.location = filters.location;
    }
    if (filters.minPrice != null) {
      out.minPrice = filters.minPrice;
    }
    if (filters.maxPrice != null) {
      out.maxPrice = filters.maxPrice;
    }
    if (filters.minRating != null) {
      out.minRating = filters.minRating;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }

  /**
   * Normaliza los alias de la query de búsqueda (businessDescription, productDescription, etc.)
   * a los campos estándar description y tags para que el resto de la app siga funcionando.
   */
  private normalizeSearchItem(item: Record<string, unknown>): SearchResultItem {
    const description =
      item['businessDescription'] ?? item['productDescription'] ?? item['description'];
    const rawTags =
      item['businessTags'] ?? item['catalogTags'] ?? item['productTags'] ?? item['tags'];
    const tags = Array.isArray(rawTags) && rawTags.length > 0 && typeof rawTags[0] === 'object'
      ? (rawTags as Array<{ tag?: { name?: string } }>)
          .map((pt) => pt.tag?.name)
          .filter((n): n is string => n != null)
      : rawTags;
    const rest = { ...item };
    delete rest['businessDescription'];
    delete rest['productDescription'];
    delete rest['businessTags'];
    delete rest['catalogTags'];
    delete rest['productTags'];
    return { ...rest, description, tags } as SearchResultItem;
  }
}
