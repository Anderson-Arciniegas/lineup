import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AllowedFilesDirectory,
  BusinessApiFileService,
  UtilsService,
} from '@lineup/core';
import { Button, ImageCropper } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { BusinessService } from 'libs/shared/core/src/lib/services/business.service';
import { base64ToFile } from 'ngx-image-cropper';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
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
    SkeletonModule,
    FloatLabel,
    TranslateModule,
    ReactiveFormsModule,
    Dialog,
    ImageCropper,
  ],
  templateUrl: './edit-business-page.html',
  styleUrl: './edit-business-page.scss',
})
export class EditBusinessPage implements OnInit {
  cropperVisible = false;
  imageUrl = '';
  imgCode = '';
  loadingFile = false;
  uploadFailed = false;
  adultContent = false;

  private _utils = inject(UtilsService);
  private readonly _fb = inject(FormBuilder);
  private readonly _businessService = inject(BusinessService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _apiFileService = inject(BusinessApiFileService);
  private _subscription: Subscription = new Subscription();

  readonly businessForm = this._fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    businessPath: ['', [Validators.required]],
    phone: [''],
  });

  ngOnInit(): void {
    this.getBusiness();
  }
  onCropped($event) {
    console.log($event);
    const image = $event as string;
    this.cropperVisible = false;

    this._cdr.detectChanges();
    this.uploadFile(image);
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

  private getBusiness(): void {
    this._subscription.add(
      this._businessService.myBusiness().subscribe((business) => {
        console.log(business);
        this.businessForm.patchValue({
          name: business.name,
          email: business.email,
          businessPath: business.path,
          phone: business.telephone,
        });
      }),
    );
  }
}
