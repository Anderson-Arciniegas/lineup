import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { StateSchema, UpdateUserInput, UserSchema } from '@lineup/core';
import {
  DirectoriesEnum,
  StatesPublicService,
  UserApiFilePublicService,
  UserPublicService,
  UtilsService,
} from '@lineup/core';
import { Button, ImageCropper } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { base64ToFile } from 'ngx-image-cropper';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { finalize, map, take } from 'rxjs';

const MAX_NAME_LENGTH = 20;
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

@Component({
  selector: 'app-profile-page',
  imports: [
    CommonModule,
    FloatLabelModule,
    InputTextModule,
    TranslateModule,
    Button,
    SelectModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  providers: [DialogService],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserPublicService);
  private readonly statesService = inject(StatesPublicService);
  private readonly messageService = inject(MessageService);
  private readonly apiFileService = inject(UserApiFilePublicService);
  private readonly utilsService = inject(UtilsService);
  private readonly dialogService = inject(DialogService);
  private readonly translateService = inject(TranslateService);

  readonly maxFirstNameLength = MAX_NAME_LENGTH;
  readonly maxLastNameLength = MAX_NAME_LENGTH;

  states: StateSchema[] = [];
  loadingUser = true;
  saving = false;
  imageUrl = '';
  imgCode = '';
  loadingFile = false;
  uploadFailed = false;
  adultContent = false;
  ref: DynamicDialogRef | undefined;

  readonly profileForm = this.fb.group({
    id: [0 as number, [Validators.required]],
    firstName: [
      '',
      [Validators.required, Validators.maxLength(MAX_NAME_LENGTH)],
    ],
    lastName: [
      '',
      [Validators.required, Validators.maxLength(MAX_NAME_LENGTH)],
    ],
    username: [
      '',
      [
        Validators.required,
        Validators.maxLength(MAX_NAME_LENGTH),
        Validators.pattern(USERNAME_PATTERN),
      ],
    ],
    idState: [null as number | null],
  });

  ngOnInit(): void {
    this.loadStates();
    this.loadUser();
  }

  private loadUser(): void {
    this.loadingUser = true;
    this.userService
      .getMe()
      .pipe(
        take(1),
        finalize(() => {
          this.loadingUser = false;
        }),
      )
      .subscribe({
        next: (me: UserSchema) => {
          console.log(me);
          this.profileForm.patchValue({
            id: me.id,
            firstName: me.firstName ?? '',
            lastName: me.lastName ?? '',
            username: me.username ?? '',
            idState: (me as UserSchema & { idState?: number }).idState ?? null,
          });
          this.imageUrl = me.profileImage?.url ?? '';
          this.imgCode = me.profileImage?.name ?? '';
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'general.error',
            detail: 'general.error',
          });
        },
      });
  }

  private loadStates(): void {
    this.statesService
      .findAllStates()
      .pipe(take(1))
      .subscribe({
        next: (list) => (this.states = list),
        error: () => {
          this.messageService.add({
            severity: 'warn',
            summary: 'general.warning',
            detail: 'general.error',
          });
        },
      });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.saving) return;

    const raw = this.profileForm.getRawValue();
    const data: UpdateUserInput = {
      firstName: raw.firstName ?? undefined,
      lastName: raw.lastName ?? undefined,
      username: raw.username ?? undefined,
      imageCode: this.imgCode || undefined,
      idState: raw.idState ?? undefined,
    };

    this.saving = true;
    this.userService
      .updateUser(data)
      .pipe(
        take(1),
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('general.success'),
            detail: this.translateService.instant(
              'toast.userUpdatedSuccessfully',
            ),
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('general.error'),
            detail: this.translateService.instant('general.error'),
          });
        },
      });
  }

  openImageCropper(): void {
    this.ref = this.dialogService.open(ImageCropper, {
      header: this.translateService.instant('general.addImage'),
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

  uploadFile(fileBase64: string): void {
    this.loadingFile = true;

    const image: File = this.utilsService.blobToFile(
      base64ToFile(fileBase64),
      'file',
    );

    const fileUpload = new FormData();
    const extension = this.utilsService.getExtensionFile(fileBase64);

    fileUpload.append('directory', DirectoriesEnum.USER);
    fileUpload.append('file', image, `image.${extension}`);

    this.apiFileService
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
              return response;
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
          this.adultContent = error.error?.code === 22011;
        },
      });
  }

  get usernameControl() {
    return this.profileForm.get('username');
  }
}
