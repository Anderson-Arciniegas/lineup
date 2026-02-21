import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AllowedFilesDirectory,
  AppConfigService,
  BusinessApiFileService,
  BusinessSchema,
  BusinessService,
  CatalogSchema,
  CatalogService,
  CreateCatalogInput,
  UpdateCatalogInput,
  UtilsService,
} from '@lineup/core';
import { Button, ImageCropper, ProductBreadcrumb } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { base64ToFile } from 'ngx-image-cropper';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { map, Subscription } from 'rxjs';

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
    Toast,
  ],
  templateUrl: './create-catalog-page.html',
  styleUrl: './create-catalog-page.scss',
  providers: [MessageService],
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
  maxLengthCatalogName = 50;

  private readonly _subscription: Subscription = new Subscription();
  private readonly _utils = inject(UtilsService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _apiFileService = inject(BusinessApiFileService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _businessService = inject(BusinessService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _catalogService = inject(CatalogService);
  private readonly _messageService = inject(MessageService);

  ngOnInit() {
    this.path = this._activatedRoute.snapshot.params['business'];
    console.log(this.path);

    this.getBusiness();

    this.createCatalogForm = this._formBuilder.group({
      catalogName: [
        '',
        [Validators.required, Validators.maxLength(this.maxLengthCatalogName)],
      ],
      tag: [''],
    });

    this.catalogPath = this._activatedRoute.snapshot.params['catalogPath'];
    if (this.catalogPath) {
      this.getCatalog();
    }
  }

  private getBusiness(): void {
    this._subscription.add(
      this._businessService.getBusinessByPath(this.path).subscribe({
        next: (business) => {
          console.log(business);
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
    this.tags = this.catalog.tags || [];
    this.imgCode = this.catalog.image.name || '';
    this.imageUrl = this.catalog.image.url || '';
    this.createCatalogForm.patchValue({
      catalogName: this.catalog.title,
    });
  }

  addTag() {
    if (this.createCatalogForm.get('tag')?.value) {
      this.tags.push(this.createCatalogForm.get('tag')?.value);
    }
    this.createCatalogForm.get('tag')?.setValue('');
    console.log(this.tags);
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
  }

  createCatalog() {
    if (this.createCatalogForm.invalid || this.attempt) {
      this.createCatalogForm.markAllAsTouched();
      return;
    }

    this.attempt = true;
    const { catalogName } = this.createCatalogForm.value;

    if (this.catalogPath) {
      const updateCatalogInput: UpdateCatalogInput = {
        idCatalog: this.catalog.id,
        title: catalogName,
        tags: this.tags && this.tags.length > 0 ? this.tags : undefined,
        imageCode: this.imgCode,
      };

      this._subscription.add(
        this._catalogService.updateCatalog(updateCatalogInput).subscribe({
          next: (catalog) => {
            console.log(catalog);
            this.attempt = false;
            this._messageService.add({
              severity: 'success',
              summary: this._translate.instant('general.success'),
              detail: this._translate.instant('general.catalogUpdated'),
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
        title: catalogName,
        tags: this.tags && this.tags.length > 0 ? this.tags : undefined,
        imageCode: this.imgCode,
      };

      this._subscription.add(
        this._catalogService.createCatalog(createCatalogInput).subscribe({
          next: (catalog) => {
            console.log(catalog);
            this.attempt = false;
            this._messageService.add({
              severity: 'success',
              summary: this._translate.instant('general.success'),
              detail: this._translate.instant('general.catalogCreated'),
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
    }
  }

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

    this.ref.onClose.subscribe((image: string) => {
      if (image) {
        this.uploadFile(image);
      }
    });
  }

  uploadFile(fileBase64: any) {
    this.loadingFile = true;

    const image: File = this._utils.blobToFile(
      base64ToFile(fileBase64),
      'file',
    );

    const fileUpload = new FormData();
    const extension = this._utils.getExtensionFile(fileBase64);

    fileUpload.append('directory', AllowedFilesDirectory.Public);
    fileUpload.append('file', image, `image.${extension}`);

    this._subscription.add(
      this._apiFileService
        .post('files/upload', fileUpload)
        .pipe(
          map((response) => {
            console.log(response);
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
