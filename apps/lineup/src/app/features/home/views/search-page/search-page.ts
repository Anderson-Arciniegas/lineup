import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  ProductPublicService,
  ProductSearchFiltersInput,
  SearchFiltersApplyPayload,
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
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
// import gsap from 'gsap';
// import ScrollTrigger from 'gsap/ScrollTrigger';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SkeletonModule } from 'primeng/skeleton';
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

/**
 * Resultados de búsqueda unificada (negocios, catálogos, productos) o listado por etiqueta,
 * con scroll infinito, filtros en diálogo y reinicio de estado al cambiar parámetros de ruta.
 */
@Component({
  selector: 'app-search-page',
  imports: [
    CommonModule,
    Button,
    BusinessCard,
    ProductCard,
    CatalogCard,
    ButtonModule,
    SearchFilters,
    DialogModule,
    TranslateModule,
    FormsModule,
    SkeletonModule,
    SearchBar,
    InfiniteScrollDirective,
  ],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPage implements OnInit, OnDestroy {
  visible: boolean;
  private readonly searchQuerySignal = signal('');
  private readonly itemsSignal = signal<SearchResultItem[]>([]);
  private readonly attemptSignal = signal(false);

  /** Celdas de esqueleto mientras `attempt` (misma rejilla que los resultados). */
  readonly searchSkeletonSlots = [1, 2, 3, 4, 5, 6] as const;
  private readonly pageSignal = signal(1);
  ref: DynamicDialogRef;
  private readonly noMoreResultsSignal = signal(false);
  private readonly searchTypeFilterSignal = signal<SearchTargetEnum>(
    SearchTargetEnum.ALL,
  );
  private readonly productFiltersSignal = signal<ProductSearchFiltersInput>({});
  /** Desde `data.searchMode` de la ruta (`search` vs `tag`). */
  private readonly searchModeSignal = signal<'search' | 'tag'>('search');
  private readonly searchTrigger$ = new Subject<void>();
  private readonly _userService = inject(UserPublicService);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _utils = inject(UtilsService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _subscription = new Subscription();

  get searchQuery(): string {
    return this.searchQuerySignal();
  }

  get items(): SearchResultItem[] {
    return this.itemsSignal();
  }

  get attempt(): boolean {
    return this.attemptSignal();
  }

  get page(): number {
    return this.pageSignal();
  }

  get noMoreResults(): boolean {
    return this.noMoreResultsSignal();
  }

  get searchTypeFilter(): SearchTargetEnum {
    return this.searchTypeFilterSignal();
  }

  get productFilters(): ProductSearchFiltersInput {
    return this.productFiltersSignal();
  }

  get searchMode(): 'search' | 'tag' {
    return this.searchModeSignal();
  }

  /**
   * Configura el pipeline reactivo de búsqueda (`searchTrigger$` + `switchMap`)
   * y reacciona a `paramMap` / `data` para alternar modo texto vs tag.
   */
  ngOnInit(): void {
    this._subscription.add(
      this.searchTrigger$
        .pipe(
          filter(() => !this.noMoreResults),
          tap(() => {
            this.attemptSignal.set(true);
          }),
          switchMap(() => {
            if (this.searchMode === 'tag') {
              return this._productPublicService
                .getAllByTag({ page: this.page, limit: 10 }, this.searchQuery)
                .pipe(
                  finalize(() => {
                    this.attemptSignal.set(false);
                  }),
                );
            }
            return this._userService
              .search(
                { page: this.page, limit: 10, search: this.searchQuery },
                this.searchTypeFilter as SearchTargetEnum,
                this.productFilters,
              )
              .pipe(
                finalize(() => {
                  this.attemptSignal.set(false);
                }),
              );
          }),
        )
        .subscribe({
          next: (results) => {
            if (results.items.length > 0) {
              this.pageSignal.update((page) => page + 1);
            } else {
              this.noMoreResultsSignal.set(true);
            }

            this.itemsSignal.update((items) => [...items, ...results.items]);
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
        this.searchQuerySignal.set(
          params.get('query') ?? params.get('tag') ?? '',
        );
        this.searchModeSignal.set(
          (data['searchMode'] as 'search' | 'tag') ?? 'search',
        );
        this.resetSearchState();
        if (this.searchQuery) {
          this.getSearchResults();
        }
      }),
    );
  }

  /** Navega a la URL de búsqueda y reinicia paginación y resultados. */
  onSearchSubmit(query: string): void {
    if (query === '') return;
    this.searchQuerySignal.set(query);
    this._utils.navigate([
      AppConfigService.config.routes.search,
      this.searchQuery,
    ]);
    this.resetSearchState();
    this.getSearchResults();
  }

  /** Emite en el subject interno para disparar la siguiente página de resultados. */
  getSearchResults(): void {
    this.searchTrigger$.next();
  }

  /** Abre el componente `SearchFilters` en un diálogo modal de PrimeNG. */
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
      .subscribe((payload: SearchFiltersApplyPayload | undefined) => {
        if (payload) {
          this.setFilters(payload);
        }
      });
  }

  /** Aplica objetivo de búsqueda y filtros de producto devueltos por el modal. */
  setFilters(payload: SearchFiltersApplyPayload): void {
    this.searchTypeFilterSignal.set(payload.target);
    this.productFiltersSignal.set({ ...payload.productFilters });

    this.resetSearchState();
    this.getSearchResults();
  }

  /** Handler de infinite scroll: pide la siguiente página si aún hay resultados. */
  onScroll(): void {
    this.getSearchResults();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  private resetSearchState(): void {
    this.itemsSignal.set([]);
    this.noMoreResultsSignal.set(false);
    this.pageSignal.set(1);
  }
}
