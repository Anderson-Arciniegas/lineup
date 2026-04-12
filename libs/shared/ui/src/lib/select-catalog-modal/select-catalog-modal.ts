import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatalogPrivateService, CatalogSchema } from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Button } from '../button/button';

/**
 * Diálogo para elegir un catálogo del negocio: lista precargada o fetch de `findAllMyCatalogs`.
 * Cierra con `id` del catálogo seleccionado o sin valor al cancelar.
 */
@Component({
  selector: 'lib-select-catalog-modal',
  imports: [
    CommonModule,
    DialogModule,
    TranslateModule,
    Button,
    ProgressSpinner,
  ],
  templateUrl: './select-catalog-modal.html',
  styleUrl: './select-catalog-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectCatalogModal implements OnInit {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly catalogService = inject(CatalogPrivateService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly catalogs = signal<CatalogSchema[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);

  /** Fija el título del diálogo traducido. */
  constructor() {
    this.config.header = this.translate.instant('general.selectCatalog');
  }

  /** Usa `data.catalogs` si viene en config; si no, carga desde API. */
  ngOnInit(): void {
    const preloaded = this.config.data?.catalogs as CatalogSchema[] | undefined;
    if (preloaded !== undefined) {
      this.catalogs.set([...preloaded]);
      this.loading.set(false);
      return;
    }

    this.catalogService
      .findAllMyCatalogs({ page: 1, limit: 200 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.catalogs.set(response.items);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }

  /** Confirma la selección devolviendo el id del catálogo. */
  select(catalog: CatalogSchema): void {
    this.ref.close(catalog.id);
  }

  /** Cierra sin resultado. */
  cancel(): void {
    this.ref.close();
  }
}
