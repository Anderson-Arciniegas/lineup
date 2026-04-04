import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  ProductPublicService,
  SearchResultItem,
  SearchTargetEnum,
  UserPublicService,
  UtilsService,
} from '@lineup/core';
import {
  BusinessCard,
  Button,
  CatalogCard,
  ProductCard,
  SearchBar,
  SearchFilters,
  Ui,
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { TreeNode } from 'primeng/api';
// import gsap from 'gsap';
// import ScrollTrigger from 'gsap/ScrollTrigger';
import { ButtonModule } from 'primeng/button';
import { Carousel } from 'primeng/carousel';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tag } from 'primeng/tag';
import {
  combineLatest,
  filter,
  finalize,
  Subject,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-search-page',
  imports: [
    CommonModule,
    Ui,
    Button,
    InputIcon,
    IconField,
    BusinessCard,
    ProductCard,
    CatalogCard,
    Carousel,
    ButtonModule,
    Tag,
    SearchFilters,
    DialogModule,
    TranslateModule,
    FormsModule,
    ProgressSpinner,
    SearchBar,
    InfiniteScrollDirective,
  ],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage implements OnInit {
  visible: boolean;
  searchQuery = '';
  items: SearchResultItem[] = [];
  attempt = false;
  page = 1;
  ref: DynamicDialogRef;
  noMoreResults: boolean;
  searchTypeFilter: SearchTargetEnum = SearchTargetEnum.ALL;
  searchLocationFilter: string;
  searchDeliveryFilter: string;
  /** Desde `data.searchMode` de la ruta (`search` vs `tag`). */
  searchMode: 'search' | 'tag' = 'search';
  private readonly searchTrigger$ = new Subject<void>();
  private readonly _userService = inject(UserPublicService);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _utils = inject(UtilsService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _subscription = new Subscription();

  ngOnInit(): void {
    this._subscription.add(
      this.searchTrigger$
        .pipe(
          filter(() => !this.noMoreResults),
          tap(() => {
            this.attempt = true;
          }),
          switchMap(() => {
            if (this.searchMode === 'tag') {
              return this._productPublicService
                .getAllByTag({ page: this.page, limit: 10 }, this.searchQuery)
                .pipe(
                  finalize(() => {
                    this.attempt = false;
                  }),
                );
            }
            return this._userService
              .search(
                { page: this.page, limit: 10, search: this.searchQuery },
                this.searchTypeFilter as SearchTargetEnum,
              )
              .pipe(
                finalize(() => {
                  this.attempt = false;
                }),
              );
          }),
        )
        .subscribe({
          next: (results) => {
            console.log(results);
            if (results.items.length > 0) {
              this.page++;
            } else {
              this.noMoreResults = true;
            }

            this.items = [...this.items, ...results.items];
          },
          error: (error) => {
            console.error(error);
          },
        }),
    );

    this._subscription.add(
      combineLatest([
        this._activatedRoute.paramMap,
        this._activatedRoute.data,
      ]).subscribe(([params, data]) => {
        this.searchQuery = params.get('query') ?? params.get('tag') ?? '';
        this.searchMode = (data['searchMode'] as 'search' | 'tag') ?? 'search';
        this.items = [];
        this.noMoreResults = false;
        this.page = 1;
        if (this.searchQuery) {
          this.getSearchResults();
        }
      }),
    );
  }

  onSearchSubmit(query: string): void {
    if (query === '') return;
    this.searchQuery = query;
    this._utils.navigate([
      AppConfigService.config.routes.search,
      this.searchQuery,
    ]);
    this.items = [];
    this.noMoreResults = false;
    this.page = 1;
    this.getSearchResults();
  }

  getSearchResults(): void {
    this.searchTrigger$.next();
  }

  showFiltersDialog() {
    this.ref = this._dialogService.open(SearchFilters, {
      header: this._translate.instant('general.filters'),
      width: '500px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      modal: true,
      closable: true,
    });

    this.ref.onClose
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((filters) => {
        if (filters) {
          this.setFilters(filters as TreeNode[]);
        }
      });
  }

  setFilters(filters: TreeNode[]): void {
    if (filters[0]) {
      this.searchTypeFilter = filters[0].data as SearchTargetEnum;
    } else {
      this.searchTypeFilter = SearchTargetEnum.ALL;
    }
    if (filters[1]) {
      this.searchLocationFilter = filters[1].data as string;
    }
    if (filters[2]) {
      this.searchDeliveryFilter = filters[2].data as string;
    }

    this.items = [];
    this.noMoreResults = false;
    this.page = 1;
    this.getSearchResults();
  }

  onScroll(): void {
    this.getSearchResults();
  }
}
