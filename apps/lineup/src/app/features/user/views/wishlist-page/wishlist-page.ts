import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProductPublicService, ProductSchema } from '@lineup/core';
import { ProductCard } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

/**
 * Lista paginada de productos marcados con “me gusta” por el usuario, con scroll infinito.
 */
@Component({
  selector: 'app-wishlist-page',
  imports: [
    CommonModule,
    ProductCard,
    TranslateModule,
    ProgressSpinner,
    InfiniteScrollDirective,
  ],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.scss',
})
export class WishlistPage implements OnInit {
  products: ProductSchema[] = [];
  attempt = false;
  page = 1;
  noMoreResults = false;
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _subscription = new Subscription();

  ngOnInit(): void {
    this.getFavoritesProducts();
  }

  /** Solicita la siguiente página de productos favoritos si no hay carga en curso ni fin de lista. */
  getFavoritesProducts(): void {
    if (this.attempt || this.noMoreResults) return;
    this.attempt = true;
    this._subscription.add(
      this._productPublicService
        .findLikedProducts({ page: this.page, limit: 20 })
        .subscribe({
          next: (products) => {
            this.attempt = false;
            this.products = [...this.products, ...products.items];
            this.page++;
            if (products.items.length === 0) {
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

  /** Dispara la siguiente página al llegar al final del viewport (infinite scroll). */
  onScroll(): void {
    this.getFavoritesProducts();
  }
}
