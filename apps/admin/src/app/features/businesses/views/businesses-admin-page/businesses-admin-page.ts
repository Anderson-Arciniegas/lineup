import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import type { BusinessSchema } from '@lineup/core';
import { SEO_SITE_ORIGIN } from '@lineup/core';
import { environment } from '@lineup/envs';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { ProgressSpinner } from 'primeng/progressspinner';
import { finalize } from 'rxjs';
import { BusinessAdminService } from '../../../../core/services/business-admin.service';

const PAGE_SIZE = 25;

@Component({
  selector: 'app-businesses-admin-page',
  imports: [
    CommonModule,
    TranslateModule,
    InfiniteScrollDirective,
    ProgressSpinner,
  ],
  templateUrl: './businesses-admin-page.html',
  styleUrl: './businesses-admin-page.scss',
})
export class BusinessesAdminPage implements OnInit {
  private readonly businessAdmin = inject(BusinessAdminService);
  private readonly siteOrigin = inject(SEO_SITE_ORIGIN, { optional: true });

  readonly items = signal<BusinessSchema[]>([]);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly busy = signal(false);
  readonly loadingInitial = signal(true);
  readonly loadingMore = signal(false);
  readonly noMore = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadMore();
  }

  onScroll(): void {
    this.loadMore();
  }

  /**
   * Lineup expone el negocio en `/:business` (slug = `BusinessSchema.path`).
   */
  lineupPublicUrl(business: BusinessSchema): string | null {
    const origin = (
      this.siteOrigin?.replace(/\/$/, '').trim() ||
      environment.publicSiteUrl?.replace(/\/$/, '').trim() ||
      ''
    );
    const raw = (business.path ?? '').trim().replace(/^\/+/, '');
    if (!origin || !raw) {
      return null;
    }
    const pathSegments = raw
      .split('/')
      .filter((s) => s.length > 0)
      .map((s) => encodeURIComponent(s))
      .join('/');
    return `${origin}/${pathSegments}`;
  }

  private loadMore(): void {
    if (this.busy() || this.noMore()) {
      return;
    }
    this.busy.set(true);
    const first = this.items().length === 0;
    if (first) {
      this.loadingInitial.set(true);
    } else {
      this.loadingMore.set(true);
    }

    this.businessAdmin
      .findAllBusinesses({ page: this.page(), limit: PAGE_SIZE })
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.loadingInitial.set(false);
          this.loadingMore.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          const batch = res.items ?? [];
          this.total.set(res.total ?? 0);
          this.items.update((list) => [...list, ...batch]);
          this.page.update((p) => p + 1);
          const accumulated = this.items().length;
          const total = res.total ?? 0;
          if (batch.length === 0 || accumulated >= total) {
            this.noMore.set(true);
          }
        },
        error: () => {
          if (this.items().length === 0) {
            this.error.set('admin.feature.loadError');
          }
        },
      });
  }
}
