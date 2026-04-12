import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  BusinessPublicService,
  BusinessSchema,
  BusinessPrivateService,
} from '@lineup/core';
import { BusinessCard } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

/**
 * Negocios que el usuario sigue (favoritos), con scroll infinito sobre la API pública paginada.
 */
@Component({
  selector: 'app-favorites-page',
  imports: [
    CommonModule,
    BusinessCard,
    TranslateModule,
    InfiniteScrollDirective,
    ProgressSpinner,
  ],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.scss',
})
export class FavoritesPage implements OnInit {
  businesses: BusinessSchema[] = [];
  attempt = false;
  page = 1;
  noMoreResults = false;
  private readonly _businessService = inject(BusinessPrivateService);
  private readonly _businessPublicService = inject(BusinessPublicService);
  private readonly _subscription = new Subscription();

  ngOnInit(): void {
    this.getFavoritesBusinesses();
  }

  /** Acumula páginas de `findFollowedBusinesses` hasta recibir página vacía. */
  getFavoritesBusinesses(): void {
    if (this.attempt || this.noMoreResults) return;
    this.attempt = true;
    this._subscription.add(
      this._businessPublicService
        .findFollowedBusinesses({ page: this.page, limit: 20 })
        .subscribe({
          next: (businesses) => {
            this.attempt = false;
            this.businesses = [...this.businesses, ...businesses.items];
            this.page++;
            if (businesses.items.length === 0) {
              this.noMoreResults = true;
            }
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
        }),
    );
  }

  onScroll(): void {
    this.getFavoritesBusinesses();
  }
}
