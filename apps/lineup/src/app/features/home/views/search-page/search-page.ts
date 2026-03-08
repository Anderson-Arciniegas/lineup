import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  BusinessSchema,
  CatalogSchema,
  ProductSchema,
  SearchTargetEnum,
  UserService,
  UtilsService,
} from '@lineup/core';
import {
  BusinessCard,
  Button,
  CatalogCard,
  ProductCard,
  SearchFilters,
  Ui,
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { Subscription } from 'rxjs';

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
  ],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage implements OnInit {
  visible: boolean;
  searchQuery = '';
  products: ProductSchema[] = [];
  catalogs: CatalogSchema[] = [];
  businesses: BusinessSchema[] = [];
  attempt = false;
  page = 1;
  ref: DynamicDialogRef;
  searchTypeFilter: SearchTargetEnum = SearchTargetEnum.ALL;
  searchLocationFilter: string;
  searchDeliveryFilter: string;
  private readonly _userService = inject(UserService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _utils = inject(UtilsService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);

  private readonly _subscription = new Subscription();

  ngOnInit(): void {
    window.addEventListener('scroll', function () {
      const searchBar = document.querySelector('.search');
      const filters = document.querySelector('.filters-container');

      if (window.scrollY > 100) {
        searchBar.classList.add('shrink');
      } else {
        searchBar.classList.remove('shrink');
      }

      // if (window.scrollY > 280) {
      //   filters.classList.add('filters-shrink');
      // } else {
      //   filters.classList.remove('filters-shrink');
      // }
    });

    this.searchQuery = this._activatedRoute.snapshot.params['query'];
    if (this.searchQuery) {
      this.getSearchResults();
    }
  }

  onSearchSubmit(): void {
    if (this.searchQuery === '') return;
    this._utils.navigate([
      AppConfigService.config.routes.search,
      this.searchQuery,
    ]);
    this.products = [];
    this.catalogs = [];
    this.businesses = [];
    this.page = 1;
    this.getSearchResults();
  }

  getSearchResults(): void {
    if (this.attempt) return;
    this.attempt = true;
    this._subscription.add(
      this._userService
        .search(
          { page: this.page, limit: 10, search: this.searchQuery },
          this.searchTypeFilter as SearchTargetEnum,
        )
        .subscribe({
          next: (results) => {
            this.attempt = false;
            console.log(results);
            if (results.items.length > 0) {
              this.page++;
            }
            this.products = [
              ...this.products,
              ...results.items.filter(
                (item): item is ProductSchema =>
                  item.__typename === 'ProductSchema',
              ),
            ];
            this.catalogs = [
              ...this.catalogs,
              ...results.items.filter(
                (item): item is CatalogSchema =>
                  item.__typename === 'CatalogSchema',
              ),
            ];
            this.businesses = [
              ...this.businesses,
              ...results.items.filter(
                (item): item is BusinessSchema =>
                  item.__typename === 'BusinessSchema',
              ),
            ];
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

    this.ref.onClose.subscribe((filters) => {
      console.log(filters);
      if (filters) {
        this.setFilters(filters as TreeNode[]);
      }
    });
  }

  setFilters(filters: TreeNode[]): void {
    console.log(filters);

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

    this.products = [];
    this.catalogs = [];
    this.businesses = [];
    this.page = 1;
    this.getSearchResults();
  }
}
