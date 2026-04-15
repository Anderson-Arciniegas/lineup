import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  AuthStore,
  BusinessApiFilePrivateService,
  BusinessPrivateService,
  BusinessSchema,
  CatalogPrivateService,
  CatalogSchema,
  CreateCatalogInput,
  DirectoriesEnum,
  UpdateCatalogInput,
  UtilsService,
} from '@lineup/core';
import { Button, ImageCropper, ProductBreadcrumb } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { base64ToFile } from 'ngx-image-cropper';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { map, Subscription, take } from 'rxjs';

/**
 * Formulario de alta o edición de catálogo: metadatos, color, etiquetas, imagen vía cropper
 * y subida multipart al API de archivos del negocio.
 */
@Component({
  selector: 'app-create-catalog-page',
  imports: [
    CommonModule,
    SkeletonModule,
    ProductBreadcrumb,
    InputTextModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    Button,
    PanelModule,
    MenuModule,
    ChipModule,
    ReactiveFormsModule,
    ColorPickerModule,
  ],
  templateUrl: './create-catalog-page.html',
  styleUrl: './create-catalog-page.scss',
})
export class CreateCatalogPage implements OnInit {
  business: BusinessSchema;
  catalog: CatalogSchema;
  catalogPath: string;
  createCatalogForm: FormGroup;
  isDragging = false;
  previewUrl: string | null = null;
  ref: DynamicDialogRef | undefined;
  loadingFile = false;
  uploadFailed = false;
  adultContent = false;
  imgCode = '';
  imageUrl = '';
  path: string;
  tags: string[] = [];
  attempt = false;
  submitAttempted = false;
  maxLengthCatalogName = 50;
  readonly defaultCatalogHexColor = '#ffffff';

  private readonly _subscription: Subscription = new Subscription();
  private readonly _utils = inject(UtilsService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _apiFileService = inject(BusinessApiFilePrivateService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _businessService = inject(BusinessPrivateService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _messageService = inject(MessageService);
  private readonly _authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);

  /** Inicializa formulario, negocio desde `AuthStore` y modo edición si la ruta trae `catalogPath`. */
  ngOnInit() {
    this.business = this._authStore.business();

    this.createCatalogForm = this._formBuilder.group({
      catalogName: [
        '',
        [Validators.required, Validators.maxLength(this.maxLengthCatalogName)],
      ],
      hexColor: [this.defaultCatalogHexColor],
      tag: [''],
    });

    this.catalogPath = this._activatedRoute.snapshot.params['catalogPath'];
    if (this.catalogPath) {
      this.getCatalog();
    }
  }

  /** Sincroniza el color del picker de PrimeNG con el control `hexColor` del formulario. */
  setColor($event: any): void {
    this.createCatalogForm.get('hexColor')?.setValue($event.value);
  }

  private getBusiness(): void {
    this._subscription.add(
      this._businessService.getBusinessByPath(this.path).subscribe({
        next: (business) => {
          this.business = business;
        },
      }),
    );
  }

  private getCatalog(): void {
    this._subscription.add(
      this._catalogService.findOneCatalogByPath(this.catalogPath).subscribe({
        next: (catalog) => {
          this.catalog = catalog;
          this.patchValueForm();
        },
      }),
    );
  }

  private patchValueForm(): void {
    this.tags = [...(this.catalog.tags ?? [])];
    this.imgCode = this.catalog.image.name || '';
    this.imageUrl = this.catalog.image.url || '';
    this.createCatalogForm.patchValue({
      catalogName: this.catalog.title,
      hexColor: this.catalog.hexColor || this.defaultCatalogHexColor,
    });
  }

  /** Parsea etiquetas separadas por coma, normaliza y deduplica (máximo 10). */
  addTag() {
    const raw = this.createCatalogForm.get('tag')?.value ?? '';
    const parts = raw
      .split(',')
      .map((t) => this._utils.normalizeSpaces(t))
      .filter((t) => t.length > 0);

    const next = [...this.tags];
    for (const part of parts) {
      if (next.length >= 10) {
        break;
      }
      const normalized = part.toLowerCase();
      if (!next.includes(normalized)) {
        next.push(normalized);
      }
    }
    this.tags = next;
    this.createCatalogForm.get('tag')?.setValue('');
  }

  /** Elimina una etiqueta de la lista por índice. */
  removeTag(index: number) {
    this.tags = this.tags.filter((_, i) => i !== index);
  }

  /** Crea o actualiza el catálogo según presencia de `catalogPath` y navega al listado. */
  createCatalog() {
    this.submitAttempted = true;
    if (this.createCatalogForm.invalid || this.attempt) {
      this.createCatalogForm.markAllAsTouched();
      this._messageService.add({
        severity: 'warn',
        summary: this._translate.instant('general.warning'),
        detail: this._translate.instant('validation.fieldRequired'),
      });
      return;
    }
    if (!this.imgCode) {
      this._messageService.add({
        severity: 'warn',
        summary: this._translate.instant('general.warning'),
        detail: this._translate.instant('validation.fieldRequired'),
      });
      return;
    }

    this.attempt = true;
    const { catalogName, hexColor } = this.createCatalogForm.value;
    const titleNormalized = this._utils.normalizeSpaces(catalogName ?? '');
    const tagsNormalized =
      this.tags && this.tags.length > 0
        ? this.tags.map((tag) => this._utils.normalizeSpaces(tag))
        : undefined;

    if (this.catalogPath) {
      const updateCatalogInput: UpdateCatalogInput = {
        idCatalog: this.catalog.id,
        title: titleNormalized,
        tags: tagsNormalized,
        imageCode: this.imgCode,
        hexColor: typeof hexColor === 'string' ? hexColor : undefined,
      };

      this._subscription.add(
        this._catalogService.updateCatalog(updateCatalogInput).subscribe({
          next: (catalog) => {
            this.attempt = false;
            this._messageService.add({
              severity: 'success',
              summary: this._translate.instant('general.success'),
              detail: this._translate.instant('toast.catalogUpdated'),
            });

            this._utils.navigate([
              AppConfigService.config.routes.dashboard,
              AppConfigService.config.routes.catalogs,
              catalog.path,
            ]);
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
          complete: () => {
            this.attempt = false;
          },
        }),
      );
    } else {
      const createCatalogInput: CreateCatalogInput = {
        title: titleNormalized,
        tags: tagsNormalized,
        imageCode: this.imgCode,
        hexColor: typeof hexColor === 'string' ? hexColor : undefined,
      };

      this._subscription.add(
        this._catalogService.createCatalog(createCatalogInput).subscribe({
          next: (catalog) => {
            this.attempt = false;
            this._messageService.add({
              severity: 'success',
              summary: this._translate.instant('general.success'),
              detail: this._translate.instant('toast.catalogCreated'),
            });
            if (this._isOnboardingFlow()) {
              this._utils.navigate([
                AppConfigService.config.routes.dashboard,
                AppConfigService.config.routes.setup,
                'catalog',
                catalog.path,
                AppConfigService.config.routes.createProduct,
              ]);
            } else {
              this._utils.navigate([
                AppConfigService.config.routes.dashboard,
                AppConfigService.config.routes.catalogs,
                catalog.path,
              ]);
            }
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
          complete: () => {
            this.attempt = false;
          },
        }),
      );
    }
  }

  get catalogNameControl() {
    return this.createCatalogForm.get('catalogName');
  }

  private _isOnboardingFlow(): boolean {
    let current: ActivatedRoute | null = this._activatedRoute;
    while (current) {
      if (current.snapshot.data?.['onboardingFlow'] === true) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  /** Abre el diálogo `ImageCropper` y, al cerrar con imagen, dispara `uploadFile`. */
  openImageCropper() {
    this.ref = this._dialogService.open(ImageCropper, {
      header: this._translate.instant('general.addImage'),
      width: '600px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      dismissableMask: true,
      modal: true,
      draggable: false,
      resizable: false,
      closable: true,
    });

    this.ref.onClose
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((image: string) => {
        if (image) {
          this.uploadFile(image);
        }
      });
  }

  /** Convierte base64 a `File`, envía `FormData` al endpoint de upload y guarda código/URL. */
  uploadFile(fileBase64: any) {
    this.loadingFile = true;

    const image: File = this._utils.blobToFile(
      base64ToFile(fileBase64),
      'file',
    );

    const fileUpload = new FormData();
    const extension = this._utils.getExtensionFile(fileBase64);

    fileUpload.append('directory', DirectoriesEnum.CATALOG);
    fileUpload.append('file', image, `image.${extension}`);

    this._subscription.add(
      this._apiFileService
        .post('files/upload', fileUpload)
        .pipe(
          map((response) => {
            switch (response.type) {
              case HttpEventType.Response:
                if (response.body.file) {
                  this.imgCode = response.body.file.name;
                  this.imageUrl = response.body.file.url;
                }
                return response;

              default:
                break;
            }
          }),
        )
        .subscribe({
          next: (uploadResponse) => {
            if (typeof uploadResponse === 'object' && uploadResponse.status) {
              this.uploadFailed = false;
              this.adultContent = false;
              this.loadingFile = false;
            }
          },
          error: (error) => {
            this.uploadFailed = true;
            this.loadingFile = false;
            this.adultContent = error.error.code === 22011;
          },
        }),
    );
  }
}
