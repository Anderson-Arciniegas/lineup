import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DirectoriesEnum,
  type SocialNetworkSchema,
  UtilsService,
} from '@lineup/core';
import { Button, ImageCropper } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { base64ToFile } from 'ngx-image-cropper';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { finalize, take } from 'rxjs';
import type { UpdateSocialNetworkInput } from '../../../../core/schemas';
import { AdminApiFileService } from '../../../../core/services/admin-api-file.service';
import { SocialNetworkAdminService } from '../../../../core/services/social-network-admin.service';

@Component({
  selector: 'app-create-social-network-admin-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    DialogModule,
    FloatLabelModule,
    InputTextModule,
    Button,
  ],
  templateUrl: './create-social-network-admin-modal.html',
  styleUrl: './create-social-network-admin-modal.scss',
})
export class CreateSocialNetworkAdminModal {
  readonly visible = model(false);
  readonly network = input<SocialNetworkSchema | null>(null);
  readonly saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly utils = inject(UtilsService);
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);
  private readonly dialogService = inject(DialogService);
  private readonly adminFile = inject(AdminApiFileService);
  private readonly socialAdmin = inject(SocialNetworkAdminService);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    code: ['', [Validators.required, Validators.maxLength(64)]],
  });

  readonly imageCode = signal('');
  readonly previewUrl = signal<string | null>(null);
  readonly loadingFile = signal(false);
  readonly uploadFailed = signal(false);
  readonly attempt = signal(false);

  private cropperRef?: DynamicDialogRef;

  constructor() {
    effect(() => {
      const v = this.visible();
      this.network();
      if (!v) {
        return;
      }
      untracked(() => this.syncFormFromInputs());
    });
  }

  get dialogHeaderKey(): string {
    return this.network()
      ? 'admin.socialNetworkModal.editTitle'
      : 'admin.socialNetworkModal.createTitle';
  }

  close(): void {
    this.visible.set(false);
    this.cropperRef?.close();
  }

  onDialogHide(): void {
    this.cropperRef?.close();
  }

  openImageCropper(): void {
    this.cropperRef = this.dialogService.open(ImageCropper, {
      header: this.translate.instant('general.addImage'),
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

    this.cropperRef.onClose
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((image: string | undefined) => {
        if (image) {
          this.uploadFromBase64(image);
        }
      });
  }

  submit(): void {
    const n = this.network();
    const raw = this.form.getRawValue();
    const name = this.utils.normalizeSpaces(raw.name ?? '');
    const code = this.utils.normalizeSpaces(raw.code ?? '').toUpperCase();
    const img = this.imageCode();

    if (this.form.invalid || !name) {
      this.form.markAllAsTouched();
      return;
    }

    if (!n && !img) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('general.warning'),
        detail: this.translate.instant(
          'admin.socialNetworkModal.imageRequired',
        ),
      });
      return;
    }

    if (!n) {
      if (!code) {
        this.form.markAllAsTouched();
        return;
      }
      this.attempt.set(true);
      this.socialAdmin
        .createSocialNetwork({
          name,
          code,
          imageCode: img,
        })
        .pipe(finalize(() => this.attempt.set(false)))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('general.success'),
              detail: this.translate.instant(
                'admin.socialNetworkModal.createOk',
              ),
            });
            this.saved.emit();
            this.close();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('general.error'),
              detail: this.translate.instant(
                'admin.socialNetworkModal.saveError',
              ),
            });
          },
        });
      return;
    }

    this.attempt.set(true);
    const payload: UpdateSocialNetworkInput = {
      id: n.id,
      name,
    };
    if (code) {
      payload.code = code;
    }
    if (img) {
      payload.imageCode = img;
    }

    this.socialAdmin
      .updateSocialNetwork(payload)
      .pipe(finalize(() => this.attempt.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('general.success'),
            detail: this.translate.instant('admin.socialNetworkModal.updateOk'),
          });
          this.saved.emit();
          this.close();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('general.error'),
            detail: this.translate.instant(
              'admin.socialNetworkModal.saveError',
            ),
          });
        },
      });
  }

  private syncFormFromInputs(): void {
    const n = this.network();
    this.uploadFailed.set(false);
    this.loadingFile.set(false);
    if (n) {
      this.form.patchValue({
        name: n.name ?? '',
        code: n.code ?? '',
      });
      this.form.controls.code.disable();
      this.imageCode.set(n.imageCode ?? '');
      this.previewUrl.set(n.image?.url ?? null);
    } else {
      this.form.reset({ name: '', code: '' });
      this.form.controls.code.enable();
      this.imageCode.set('');
      this.previewUrl.set(null);
    }
  }

  private uploadFromBase64(fileBase64: string): void {
    this.loadingFile.set(true);
    this.uploadFailed.set(false);

    const image = this.utils.blobToFile(base64ToFile(fileBase64), 'file');
    const extension = this.utils.getExtensionFile(fileBase64);
    const filename = `image.${extension}`;

    this.adminFile
      .upload(DirectoriesEnum.BUSINESS, image, filename)
      .pipe(
        take(1),
        finalize(() => this.loadingFile.set(false)),
      )
      .subscribe({
        next: (f) => {
          this.imageCode.set(f.name);
          this.previewUrl.set(f.url);
        },
        error: () => {
          this.uploadFailed.set(true);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('general.error'),
            detail: this.translate.instant(
              'admin.socialNetworkModal.uploadError',
            ),
          });
        },
      });
  }
}
