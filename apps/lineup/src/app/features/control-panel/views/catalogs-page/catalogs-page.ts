import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AuthStore,
  BusinessSchema,
  CatalogSchema,
  CatalogPrivateService,
} from '@lineup/core';
import { Button, CatalogCard, CreateCatalogCard } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

/** Listado paginado de catálogos propios del negocio con tarjetas y acceso a creación. */
@Component({
  selector: 'app-catalogs-page',
  imports: [
    CommonModule,
    Button,
    TranslateModule,
    CatalogCard,
    CreateCatalogCard,
    ProgressSpinner,
  ],
  templateUrl: './catalogs-page.html',
  styleUrl: './catalogs-page.scss',
})
export class CatalogsPage implements OnInit {
  catalogs: CatalogSchema[] = [];
  business: BusinessSchema;
  attempt = false;
  page = 1;
  noMoreResults = false;
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _authStore = inject(AuthStore);

  private _subscriptions = new Subscription();

  ngOnInit(): void {
    this.getCatalogs();

    this.business = this._authStore.business();
  }

  /** Carga incremental de catálogos hasta que el backend devuelve página vacía. */
  getCatalogs(): void {
    if (this.attempt || this.noMoreResults) return;
    this.attempt = true;
    this._subscriptions.add(
      this._catalogService
        .findAllMyCatalogs({ page: this.page, limit: 20 })
        .subscribe({
          next: (response) => {
            if (response.items.length > 0) {
              this.catalogs = [...this.catalogs, ...response.items];
              this.page++;
            } else {
              this.noMoreResults = true;
            }
            this.attempt = false;
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
        }),
    );
  }
}
