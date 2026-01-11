import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AllowedFilesDirectory,
  BusinessApiFileService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { base64ToFile } from 'ngx-image-cropper';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { map, Subscription } from 'rxjs';
import { Button } from '../button/button';
import { ImageCropper } from '../image-cropper/image-cropper';

@Component({
  selector: 'lib-create-catalog-modal',
  imports: [CommonModule, DialogModule, FormsModule, TranslateModule, Button],
  templateUrl: './create-catalog-modal.html',
  styleUrl: './create-catalog-modal.scss',
})
export class CreateCatalogModal {
  catalogName = '';
  isDragging = false;
  previewUrl: string | null = null;
  ref: DynamicDialogRef | undefined;
  loadingFile = false;
  uploadFailed = false;
  adultContent = false;
  imgCode = '';
  imageUrl = '';
  private readonly _subscription: Subscription = new Subscription();
  private readonly _utils = inject(UtilsService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _apiFileService = inject(BusinessApiFileService);

  createCatalog() {
    console.log(this.catalogName, this.imageUrl);
  }

  enterCreateCatalog() {
    return;
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
