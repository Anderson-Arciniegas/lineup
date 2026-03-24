import { inject, Injectable } from '@angular/core';
import {
  MY_PRODUCT_RATING_QUERY,
  MY_PRODUCT_RATINGS_QUERY,
  PRODUCT_RATINGS_QUERY,
  RATE_PRODUCT_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type {
  InfinityScrollInput,
  PaginatedProductRatings,
  RateProductInput,
} from '../../models';
import { ProductRatingSchema } from '../../schemas';

@Injectable({
  providedIn: 'root',
})
export class RatingPublicService {
  private apollo = inject(Apollo);

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

  productRatings(
    idProduct: number,
    pagination: InfinityScrollInput
  ): Observable<PaginatedProductRatings> {
    return this.apollo
      .use('userAPI')
      .query<{ productRatings: PaginatedProductRatings }>({
        query: PRODUCT_RATINGS_QUERY,
        variables: { idProduct, pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.productRatings));
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
}
