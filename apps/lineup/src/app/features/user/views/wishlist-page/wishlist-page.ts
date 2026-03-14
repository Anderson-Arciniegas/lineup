import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProductSchema, ProductService, UserService } from '@lineup/core';
import { ProductCard } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

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
  private readonly _productService = inject(ProductService);
  private readonly _userService = inject(UserService);
  private readonly _subscription = new Subscription();

  ngOnInit(): void {
    this.getFavoritesProducts();
  }

  getFavoritesProducts(): void {
    if (this.attempt || this.noMoreResults) return;
    this.attempt = true;
    this._subscription.add(
      this._userService
        .findLikedProducts({ page: this.page, limit: 20 })
        .subscribe({
          next: (products) => {
            console.log(products);
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
          complete: () => {
            console.log('complete');
          },
        }),
    );
  }

  onScroll(): void {
    console.log('onScroll');
    this.getFavoritesProducts();
  }
}
