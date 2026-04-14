import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import type { UserSchema } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { ProgressSpinner } from 'primeng/progressspinner';
import { finalize } from 'rxjs';
import { UsersAdminService } from '../../../../core/services/users-admin.service';

const PAGE_SIZE = 25;

@Component({
  selector: 'app-users-admin-page',
  imports: [
    CommonModule,
    TranslateModule,
    InfiniteScrollDirective,
    ProgressSpinner,
  ],
  templateUrl: './users-admin-page.html',
  styleUrl: './users-admin-page.scss',
})
export class UsersAdminPage implements OnInit {
  private readonly usersAdmin = inject(UsersAdminService);

  readonly items = signal<UserSchema[]>([]);
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

    this.usersAdmin
      .findAllUsers({ page: this.page(), limit: PAGE_SIZE })
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
