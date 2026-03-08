import { inject, Injectable } from '@angular/core';
import {
  CHANGE_PASSWORD_MUTATION,
  CREATE_USER_MUTATION,
  FEATURED_BUSINESSES_QUERY,
  FEATURED_CATALOGS_QUERY,
  FEATURED_PRODUCTS_QUERY,
  FIND_FOLLOWED_BUSINESSES_QUERY,
  FIND_LIKED_PRODUCTS_QUERY,
  FOLLOW_BUSINESS_MUTATION,
  GET_ME_QUERY,
  GET_USER_BY_ID_QUERY,
  HAS_LIKED_PRODUCT_QUERY,
  IS_FOLLOWING_BUSINESS_QUERY,
  LIKE_PRODUCT_MUTATION,
  LOGIN_MUTATION,
  LOGIN_WITH_GOOGLE_MUTATION,
  MY_PRODUCT_RATING_QUERY,
  MY_PRODUCT_RATINGS_QUERY,
  RATE_PRODUCT_MUTATION,
  RECORD_VISIT_MUTATION,
  REFRESH_TOKEN_MUTATION,
  REGISTER_WITH_GOOGLE_MUTATION,
  SEARCH_QUERY,
  UNFOLLOW_BUSINESS_MUTATION,
  UNLIKE_PRODUCT_MUTATION,
  UPDATE_USER_MUTATION,
  USER_LOGOUT_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchTargetEnum } from '../enums';
import {
  ChangePasswordInput,
  CreateUserInput,
  CreateUserResponse,
  LoginGoogleInput,
  RateProductInput,
  RecordVisitInput,
  RegisterGoogleInput,
  UpdateUserInput,
} from '../models';
import type {
  InfinityScrollInput,
  LoginResponse,
  PaginatedBusinesses,
  PaginatedCatalogs,
  PaginatedProductRatings,
  PaginatedProducts,
  PaginatedSearchResults,
  SearchResultItem,
} from '../models';
import {
  BusinessFollowerSchema,
  ProductRatingSchema,
  ProductReactionSchema,
  UserSchema,
} from '../schemas';

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

  likeProduct(idProduct: number): Observable<ProductReactionSchema> {
    return this.apollo
      .use('userAPI')
      .mutate<{ likeProduct: ProductReactionSchema }>({
        mutation: LIKE_PRODUCT_MUTATION,
        variables: { idProduct },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.likeProduct));
  }

  unlikeProduct(idProduct: number): Observable<boolean> {
    return this.apollo
      .use('userAPI')
      .mutate<{ unlikeProduct: boolean }>({
        mutation: UNLIKE_PRODUCT_MUTATION,
        variables: { idProduct },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.unlikeProduct));
  }

  hasLikedProduct(idProduct: number): Observable<boolean> {
    return this.apollo
      .use('userAPI')
      .query<{ hasLikedProduct: boolean }>({
        query: HAS_LIKED_PRODUCT_QUERY,
        variables: { idProduct },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.hasLikedProduct));
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

  featuredBusinesses(
    pagination: InfinityScrollInput
  ): Observable<PaginatedBusinesses> {
    return this.apollo
      .use('userAPI')
      .query<{ featuredBusinesses: PaginatedBusinesses }>({
        query: FEATURED_BUSINESSES_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.featuredBusinesses));
  }

  featuredCatalogs(
    pagination: InfinityScrollInput
  ): Observable<PaginatedCatalogs> {
    return this.apollo
      .use('userAPI')
      .query<{ featuredCatalogs: PaginatedCatalogs }>({
        query: FEATURED_CATALOGS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.featuredCatalogs));
  }

  featuredProducts(
    pagination: InfinityScrollInput
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ featuredProducts: PaginatedProducts }>({
        query: FEATURED_PRODUCTS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.featuredProducts));
  }

  search(
    pagination: InfinityScrollInput,
    target: SearchTargetEnum
  ): Observable<PaginatedSearchResults> {
    return this.apollo
      .use('userAPI')
      .query<{ search: PaginatedSearchResults }>({
        query: SEARCH_QUERY,
        variables: { pagination, target },
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

  findLikedProducts(
    pagination: InfinityScrollInput
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ findLikedProducts: PaginatedProducts }>({
        query: FIND_LIKED_PRODUCTS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findLikedProducts));
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

  myProductRatings(
    pagination: InfinityScrollInput
  ): Observable<PaginatedProductRatings> {
    return this.apollo
      .use('userAPI')
      .query<{ myProductRatings: PaginatedProductRatings }>({
        query: MY_PRODUCT_RATINGS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.myProductRatings));
  }

  myProductRating(idProduct: number): Observable<ProductRatingSchema | null> {
    return this.apollo
      .use('userAPI')
      .query<{ myProductRating: ProductRatingSchema | null }>({
        query: MY_PRODUCT_RATING_QUERY,
        variables: { idProduct },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.myProductRating));
  }

  rateProduct(data: RateProductInput): Observable<ProductRatingSchema> {
    return this.apollo
      .use('userAPI')
      .mutate<{ rateProduct: ProductRatingSchema }>({
        mutation: RATE_PRODUCT_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.rateProduct));
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

  /**
   * Normaliza los alias de la query de búsqueda (businessDescription, productDescription, etc.)
   * a los campos estándar description y tags para que el resto de la app siga funcionando.
   */
  private normalizeSearchItem(item: Record<string, unknown>): SearchResultItem {
    const description =
      item['businessDescription'] ?? item['productDescription'] ?? item['description'];
    const tags =
      item['businessTags'] ?? item['catalogTags'] ?? item['productTags'] ?? item['tags'];
    const rest = { ...item };
    delete rest['businessDescription'];
    delete rest['productDescription'];
    delete rest['businessTags'];
    delete rest['catalogTags'];
    delete rest['productTags'];
    return { ...rest, description, tags } as SearchResultItem;
  }
}
