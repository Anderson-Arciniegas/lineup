import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  catchError,
  EMPTY,
  Subscription,
  switchMap,
  take,
  timer,
} from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AppConfigService,
  BusinessApiFilePrivateService,
  ProductPrivateService,
  ProductSchema,
  UtilsService,
} from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MessageService } from 'primeng/api';
import { ProgressBar } from 'primeng/progressbar';
import { ProgressSpinner } from 'primeng/progressspinner';

const ALLOWED_EXTENSIONS = new Set([
  'csv',
  'json',
  'pdf',
  'txt',
  'xls',
  'xlsx',
  'xml',
]);
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const DRAFT_PAGE_SIZE = 50;
const IMPORT_POLLING_INTERVAL_MS = 5_000;
const IMPORT_POLLING_ATTEMPTS = 12;

@Component({
  selector: 'app-import-products-page',
  imports: [
    Button,
    CommonModule,
    InfiniteScrollDirective,
    ProgressBar,
    ProgressSpinner,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './import-products-page.html',
  styleUrl: './import-products-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportProductsPage implements OnDestroy {
  private readonly apiFileService = inject(BusinessApiFilePrivateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly productService = inject(ProductPrivateService);
  private readonly translate = inject(TranslateService);
  private readonly utils = inject(UtilsService);
  private pollingSubscription?: Subscription;

  readonly fileInput =
    viewChild<ElementRef<HTMLInputElement>>('documentFileInput');
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly selectedFile = signal<File | null>(null);
  readonly fileValidationKey = signal<string | null>(null);
  readonly isUploading = signal(false);
  readonly uploadProgress = signal(0);
  readonly draftProducts = signal<ProductSchema[]>([]);
  readonly isLoadingDrafts = signal(false);
  readonly hasDraftLoadError = signal(false);
  readonly noMoreDrafts = signal(false);
  private currentPage = 1;

  constructor() {
    this.loadDraftProducts();
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setSelectedFile(input.files?.[0] ?? null);
  }

  clearSelectedFile(): void {
    this.selectedFile.set(null);
    this.fileValidationKey.set(null);
    this.uploadProgress.set(0);
    const input = this.fileInput()?.nativeElement;
    if (input) {
      input.value = '';
    }
  }

  uploadDocument(): void {
    const file = this.selectedFile();
    if (!file || this.isUploading()) {
      this.fileValidationKey.set('importProductsPage.fileRequired');
      return;
    }
    if (!this.isValidFile(file)) {
      return;
    }

    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.apiFileService
      .uploadImportDocument(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const total = event.total ?? file.size;
            this.uploadProgress.set(
              total > 0 ? Math.round((event.loaded / total) * 100) : 0,
            );
          }
          if (event.type === HttpEventType.Response) {
            this.isUploading.set(false);
            if (event.body?.status !== true || event.body.code !== 710100) {
              this.showUploadError();
              return;
            }
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('general.success'),
              detail: this.translate.instant(
                'importProductsPage.importQueued',
              ),
              life: 5000,
            });
            this.clearSelectedFile();
            this.refreshDraftProducts();
            this.startImportPolling();
          }
        },
        error: () => {
          this.isUploading.set(false);
          this.showUploadError();
        },
      });
  }

  loadDraftProducts(): void {
    if (this.isLoadingDrafts() || this.noMoreDrafts()) {
      return;
    }

    this.isLoadingDrafts.set(true);
    this.hasDraftLoadError.set(false);
    const search = this.searchControl.value.trim();
    this.productService
      .getAllDraftProducts({
        page: this.currentPage,
        limit: DRAFT_PAGE_SIZE,
        ...(search ? { search } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.draftProducts.update((products) => [
            ...products,
            ...response.items.filter(
              (item) => !products.some((product) => product.id === item.id),
            ),
          ]);
          this.currentPage += 1;
          this.noMoreDrafts.set(response.items.length < DRAFT_PAGE_SIZE);
          this.isLoadingDrafts.set(false);
        },
        error: () => {
          this.hasDraftLoadError.set(true);
          this.isLoadingDrafts.set(false);
        },
      });
  }

  refreshDraftProducts(): void {
    this.currentPage = 1;
    this.draftProducts.set([]);
    this.noMoreDrafts.set(false);
    this.loadDraftProducts();
  }

  editProduct(product: ProductSchema): void {
    this.utils.navigate([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.importProducts,
      product.id,
      AppConfigService.config.routes.edit,
    ]);
  }

  formatFileSize(size: number): string {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  private setSelectedFile(file: File | null): void {
    this.selectedFile.set(file);
    this.uploadProgress.set(0);
    this.fileValidationKey.set(null);
    if (file) {
      this.isValidFile(file);
    }
  }

  private isValidFile(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      this.fileValidationKey.set('importProductsPage.invalidExtension');
      return false;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.fileValidationKey.set('importProductsPage.fileTooLarge');
      return false;
    }
    this.fileValidationKey.set(null);
    return true;
  }

  private startImportPolling(): void {
    this.pollingSubscription?.unsubscribe();
    const search = this.searchControl.value.trim();
    this.pollingSubscription = timer(
      IMPORT_POLLING_INTERVAL_MS,
      IMPORT_POLLING_INTERVAL_MS,
    )
      .pipe(
        take(IMPORT_POLLING_ATTEMPTS),
        switchMap(() =>
          this.productService
            .getAllDraftProducts({
              page: 1,
              limit: DRAFT_PAGE_SIZE,
              ...(search ? { search } : {}),
            })
            .pipe(catchError(() => EMPTY)),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.draftProducts.set(response.items);
          this.currentPage = 2;
          this.noMoreDrafts.set(response.items.length < DRAFT_PAGE_SIZE);
        },
      });
  }

  private showUploadError(): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('general.error'),
      detail: this.translate.instant('importProductsPage.uploadFailed'),
      life: 5000,
    });
  }
}
