import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import {
  AppConfigService,
  BusinessPublicService,
  BusinessSchema,
  DiscountSchemaFields,
  ProductPublicService,
  ProductSchema,
  StatusEnum,
} from '@lineup/core';
import { BusinessCard, Button, ProductCard } from '@lineup/ui';

const FOLLOWED_PAGE_LIMIT = 20;
const MAX_BUSINESSES_FOR_PRODUCTS = 8;
const MAX_RECENT_PRODUCTS = 12;

/**
 * Home del usuario autenticado: negocios seguidos, destacados con promociones activas
 * y mosaico de productos recientes deduplicados y ordenados por fecha de creación.
 */
@Component({
  selector: 'app-user-dashboard-page',
  imports: [
    CommonModule,
    TranslateModule,
    BusinessCard,
    ProductCard,
    Button,
    ProgressSpinner,
  ],
  templateUrl: './user-dashboard-page.html',
  styleUrl: './user-dashboard-page.scss',
})
export class UserDashboardPage implements OnInit, OnDestroy {
  readonly favoritesLink = `/${AppConfigService.config.routes.profile}/${AppConfigService.config.routes.favorites}`;

  followedBusinesses: BusinessSchema[] = [];
  businessesWithPromotions: BusinessSchema[] = [];
  recentProductsFromFollowed: ProductSchema[] = [];

  followedLoading = true;
  productsLoading = false;

  private readonly _businessPublic = inject(BusinessPublicService);
  private readonly _productPublic = inject(ProductPublicService);
  private readonly _subscription = new Subscription();

  ngOnInit(): void {
    this.loadFollowedAndProducts();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  /**
   * Obtiene negocios seguidos y, en cadena, los productos primarios de un subconjunto
   * de IDs para construir el carrusel de novedades sin duplicar entradas.
   */
  private loadFollowedAndProducts(): void {
    this.followedLoading = true;
    this._subscription.add(
      this._businessPublic
        .findFollowedBusinesses({ page: 1, limit: FOLLOWED_PAGE_LIMIT })
        .pipe(
          switchMap((paginated) => {
            this.followedBusinesses = paginated.items;
            this.businessesWithPromotions =
              this.filterBusinessesWithActivePromotions(paginated.items);
            const ids = paginated.items
              .slice(0, MAX_BUSINESSES_FOR_PRODUCTS)
              .map((b) => b.id);

            if (ids.length === 0) {
              return of<ProductSchema[]>([]);
            }

            this.productsLoading = true;
            return forkJoin(
              ids.map((idBusiness) =>
                this._productPublic
                  .getAllPrimaryProductsByBusiness({ idBusiness })
                  .pipe(catchError(() => of<ProductSchema[]>([]))),
              ),
            ).pipe(
              map((lists) => this.mergeAndSortRecentProducts(lists)),
              finalize(() => {
                this.productsLoading = false;
              }),
            );
          }),
          finalize(() => {
            this.followedLoading = false;
          }),
        )
        .subscribe({
          next: (products) => {
            this.recentProductsFromFollowed = products;
          },
          error: () => {
            this.followedBusinesses = [];
            this.businessesWithPromotions = [];
            this.recentProductsFromFollowed = [];
          },
        }),
    );
  }

  /** Une listas por `id`, ordena por `creationDate` descendente y recorta al máximo configurado. */
  private mergeAndSortRecentProducts(lists: ProductSchema[][]): ProductSchema[] {
    const byId = new Map<number, ProductSchema>();
    for (const list of lists) {
      for (const p of list) {
        if (p?.id != null && !byId.has(p.id)) {
          byId.set(p.id, p);
        }
      }
    }
    return Array.from(byId.values())
      .sort((a, b) => {
        const ta = a.creationDate
          ? new Date(a.creationDate).getTime()
          : 0;
        const tb = b.creationDate
          ? new Date(b.creationDate).getTime()
          : 0;
        return tb - ta;
      })
      .slice(0, MAX_RECENT_PRODUCTS);
  }

  /** Filtra negocios que tengan al menos un descuento activo en el rango de fechas actual. */
  private filterBusinessesWithActivePromotions(
    businesses: BusinessSchema[],
  ): BusinessSchema[] {
    return businesses.filter((b) =>
      (b.discounts ?? []).some((d) => this.isActiveDiscount(d)),
    );
  }

  /** Comprueba estado `ACTIVE` y ventana temporal `[startDate, endDate]` respecto a `Date.now`. */
  private isActiveDiscount(d: DiscountSchemaFields): boolean {
    if (d.status !== StatusEnum.ACTIVE) {
      return false;
    }
    const now = Date.now();
    const start = new Date(d.startDate).getTime();
    const end = new Date(d.endDate).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return false;
    }
    return now >= start && now <= end;
  }
}
