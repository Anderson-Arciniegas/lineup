import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  ProductRatingSchema,
  RatingPublicService,
} from '@lineup/core';
import { RatingItem } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-ratings-page',
  imports: [
    CommonModule,
    RatingItem,
    TranslateModule,
    InfiniteScrollDirective,
    ProgressSpinner,
  ],
  templateUrl: './my-ratings-page.html',
  styleUrl: './my-ratings-page.scss',
})
export class MyRatingsPage implements OnInit {
  ratings: ProductRatingSchema[] = [];
  attempt = false;
  page = 1;
  noMoreResults = false;
  loadedOnce = false;

  private readonly _ratingPublicService = inject(RatingPublicService);
  private readonly _subscription = new Subscription();

  ngOnInit(): void {
    this.loadRatings();
  }

  loadRatings(): void {
    if (this.attempt || this.noMoreResults) return;
    this.attempt = true;
    this._subscription.add(
      this._ratingPublicService
        .myProductRatings({ page: this.page, limit: 20 })
        .subscribe({
          next: (result) => {
            this.attempt = false;
            this.loadedOnce = true;
            this.ratings = [...this.ratings, ...result.items];
            this.page++;
            if (
              result.items.length === 0 ||
              this.ratings.length >= result.total
            ) {
              this.noMoreResults = true;
            }
          },
          error: () => {
            this.attempt = false;
            this.loadedOnce = true;
          },
        }),
    );
  }

  onScroll(): void {
    this.loadRatings();
  }
}
