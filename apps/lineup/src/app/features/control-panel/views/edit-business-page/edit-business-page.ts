import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AuthStore,
  BusinessApiFileService,
  BusinessSchema,
  DirectoriesEnum,
  UpdateBusinessInput,
  UtilsService,
} from '@lineup/core';
import { Button, ImageCropper } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BusinessService } from 'libs/shared/core/src/lib/services/business.service';
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
import { map, Subscription } from 'rxjs';
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
  attempt = false;
  business: BusinessSchema;
  tags: string[] = [];
  ref: DynamicDialogRef | undefined;
  readonly maxNameLength = 30;
  private _utils = inject(UtilsService);
  private readonly _fb = inject(FormBuilder);
  private readonly _businessService = inject(BusinessService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _apiFileService = inject(BusinessApiFileService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private _authStore = inject(AuthStore);
  private _subscription: Subscription = new Subscription();

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
    tag: [''],
  });

  ngOnInit(): void {
    this.getBusiness();
  }

  addTag() {
    const tagValue = this._utils.normalizeSpaces(
      this.businessForm.get('tag')?.value ?? '',
    );
    if (this.tags.includes(tagValue.toLowerCase()) || this.tags.length >= 10) {
      return;
    }
    if (tagValue) {
      this.tags.push(tagValue.toLowerCase());
    }
    this.businessForm.get('tag')?.setValue('');
    console.log(this.tags);
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
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
        this._cdr.detectChanges();
        this.uploadFile(image);
      }
    });
  }

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

  updateBusiness(): void {
    if (this.businessForm.invalid || this.attempt || !this.imgCode) {
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

      tags:
        this.tags && this.tags.length > 0
          ? this.tags.map((tag) => this._utils.normalizeSpaces(tag))
          : undefined,
    };

    this._subscription.add(
      this._businessService.updateBusiness(data).subscribe({
        next: (business) => {
          console.log(business);
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

  private getBusiness(): void {
    this._subscription.add(
      this._businessService.myBusiness().subscribe({
        next: (business) => {
          console.log(business);
          this.business = business;
          this.businessForm.patchValue({
            name: business.name,
            businessPath: business.path,
            phone: business.telephone,
            description: business.description ?? '',
            tag: '',
          });
          this.tags = this.business.tags || [];

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
}
