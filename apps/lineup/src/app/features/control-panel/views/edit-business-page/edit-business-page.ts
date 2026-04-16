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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  AuthStore,
  BusinessApiFilePrivateService,
  BusinessSchema,
  BusinessPrivateService,
  DirectoriesEnum,
  UpdateBusinessInput,
  UtilsService,
} from '@lineup/core';
import { Button, ImageCropper } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { base64ToFile } from 'ngx-image-cropper';
import { MessageService } from 'primeng/api';
import { ChipModule } from 'primeng/chip';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { map, Subscription, take } from 'rxjs';

/**
 * Formulario de datos del negocio autenticado: nombre, path público, contacto, descripción,
 * etiquetas, imagen de marca y persistencia vía `BusinessPrivateService` + actualización de `AuthStore`.
 */
@Component({
  selector: 'app-edit-business-page',
  imports: [
    CommonModule,
    Button,
    IconFieldModule,
    InputIconModule,
    InputMaskModule,
    InputTextModule,
    TextareaModule,
    SkeletonModule,
    FloatLabel,
    TranslateModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
    ChipModule,
  ],
  providers: [DialogService],
  templateUrl: './edit-business-page.html',
  styleUrl: './edit-business-page.scss',
})
export class EditBusinessPage implements OnInit {
  imageUrl = '';
  imgCode = '';
  loadingFile = false;
  uploadFailed = false;
  adultContent = false;
  saveAttempted = false;
  attempt = false;
  business: BusinessSchema;
  tags: string[] = [];
  ref: DynamicDialogRef | undefined;
  readonly maxNameLength = 30;
  /** Máximo de etiquetas distintas permitidas para el negocio. */
  readonly maxTags = 10;
  private _utils = inject(UtilsService);
  private readonly _fb = inject(FormBuilder);
  private readonly _businessService = inject(BusinessPrivateService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _apiFileService = inject(BusinessApiFilePrivateService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private readonly _route = inject(ActivatedRoute);
  private _authStore = inject(AuthStore);
  private _subscription: Subscription = new Subscription();
  private readonly destroyRef = inject(DestroyRef);

  readonly maxDescriptionLength = 100;

  /** Solo letras, números, guiones, puntos y guiones bajos. Ej: mi-negocio, abc_123, nombre.com */
  static readonly BUSINESS_PATH_PATTERN = /^[a-zA-Z0-9._-]+$/;

  readonly businessForm = this._fb.group({
    name: ['', [Validators.required, Validators.maxLength(30)]],
    businessPath: [
      '',
      [
        Validators.required,
        Validators.maxLength(30),
        Validators.pattern(EditBusinessPage.BUSINESS_PATH_PATTERN),
      ],
    ],
    phone: [''],
    description: ['', [Validators.maxLength(this.maxDescriptionLength)]],
    isOnline: [false],
    tag: [''],
  });

  /** Carga `myBusiness()` y rellena formulario, tags e imagen actual. */
  ngOnInit(): void {
    this.getBusiness();
  }

  /** Añade etiquetas desde el campo `tag` (coma-separadas), normalizadas y sin duplicados. */
  addTag() {
    const raw = this.businessForm.get('tag')?.value ?? '';
    const parts = raw
      .split(',')
      .map((t) => this._utils.normalizeSpaces(t))
      .filter((t) => t.length > 0);

    const next = [...this.tags];
    for (const part of parts) {
      if (next.length >= this.maxTags) {
        break;
      }
      const normalized = part.toLowerCase();
      if (!next.includes(normalized)) {
        next.push(normalized);
      }
    }
    this.tags = next;
    this.businessForm.get('tag')?.setValue('');
  }

  removeTag(index: number) {
    this.tags = this.tags.filter((_, i) => i !== index);
  }

  /** Diálogo de recorte; al cerrar sube la imagen al directorio de negocio. */
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
          this._cdr.detectChanges();
          this.uploadFile(image);
        }
      });
  }

  /** POST multipart al API de archivos del negocio; detecta contenido adulto bloqueado (código 22011). */
  uploadFile(fileBase64: string) {
    this.loadingFile = true;

    const image: File = this._utils.blobToFile(
      base64ToFile(fileBase64),
      'file',
    );

    const fileUpload = new FormData();
    const extension = this._utils.getExtensionFile(fileBase64);

    fileUpload.append('directory', DirectoriesEnum.BUSINESS);
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

  /** Indica si hay imagen de marca cargada (código y vista previa). */
  private _hasBusinessImage(): boolean {
    return (
      Boolean((this.imgCode ?? '').trim()) &&
      Boolean((this.imageUrl ?? '').trim())
    );
  }

  /** Valida formulario e imagen obligatoria, arma `UpdateBusinessInput` y sincroniza sesión. */
  updateBusiness(): void {
    this.saveAttempted = true;
    if (this.businessForm.invalid || this.attempt || !this._hasBusinessImage()) {
      this.businessForm.markAllAsTouched();
      this._messageService.add({
        severity: 'warn',
        summary: this._translate.instant('general.warning'),
        detail: this._translate.instant('validation.fieldRequired'),
      });
      return;
    }
    this.attempt = true;
    const data: UpdateBusinessInput = {
      id: this.business.id,
      name: this._utils.normalizeSpaces(this.businessForm.value.name ?? ''),
      imageCode: this.imgCode,
      path: this._utils
        .normalizeSpaces(this.businessForm.value.businessPath ?? '')
        .toLowerCase(),
      telephone: this._utils.normalizeSpaces(
        this.businessForm.value.phone ?? '',
      ),
      description: this.businessForm.value.description ?? '',
      isOnline: this.businessForm.value.isOnline ?? false,

      tags:
        this.tags && this.tags.length > 0
          ? this.tags.map((tag) => this._utils.normalizeSpaces(tag))
          : undefined,
    };

    this._subscription.add(
      this._businessService.updateBusiness(data).subscribe({
        next: (business) => {
          this.business = business;
          this._authStore.setBusiness(this.business);
          this.attempt = false;
          this._messageService.add({
            severity: 'success',
            summary: this._translate.instant('general.success'),
            detail: this._translate.instant(
              'toast.businessUpdatedSuccessfully',
            ),
          });
          if (this._isOnboardingFlow()) {
            this._utils.navigate([
              AppConfigService.config.routes.dashboard,
              AppConfigService.config.routes.setup,
              AppConfigService.config.routes.createCatalog,
            ]);
          }
        },
        error: (error) => {
          console.error(error);
          this.attempt = false;
        },
      }),
    );
  }

  get businessPathControl() {
    return this.businessForm.get('businessPath');
  }

  get nameControl() {
    return this.businessForm.get('name');
  }

  /** Obtiene el negocio actual del backend para modo edición. */
  private getBusiness(): void {
    this._subscription.add(
      this._businessService.myBusiness().subscribe({
        next: (business) => {
          this.business = business;
          this.businessForm.patchValue({
            name: business.name,
            businessPath: business.path,
            phone: business.telephone,
            description: business.description ?? '',
            isOnline: business.isOnline ?? false,
            tag: '',
          });
          this.tags = [...(this.business.tags ?? [])];

          if (business.image) {
            this.imageUrl = business.image.url;
            this.imgCode = business.image.name;
          }
        },
        error: (error) => {
          console.error(error);
        },
      }),
    );
  }

  private _isOnboardingFlow(): boolean {
    let current: ActivatedRoute | null = this._route;
    while (current) {
      if (current.snapshot.data?.['onboardingFlow'] === true) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }
}
