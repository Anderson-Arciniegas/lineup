import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  SocialNetworkBusinessSchema,
  SocialNetworkPrivateService,
  SocialNetworkSchema,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { take } from 'rxjs';
import { Button } from '../button/button';
import { ConfirmationModal } from '../confirmation-modal/confirmation-modal';

/**
 * Formulario para asociar URL o teléfono (WhatsApp/Telegram) a una red social del catálogo maestro.
 */
@Component({
  selector: 'lib-add-social-media-modal',
  imports: [
    CommonModule,
    DialogModule,
    FormsModule,
    TranslateModule,
    Button,
    ReactiveFormsModule,
    FloatLabel,
    InputMaskModule,
  ],
  templateUrl: './add-social-media-modal.html',
  styleUrl: './add-social-media-modal.scss',
  providers: [MessageService],
})
export class AddSocialMediaModal implements OnInit {
  socialMedia: SocialNetworkSchema;
  businessSocialNetwork: SocialNetworkBusinessSchema;
  socialMediaForm: FormGroup;
  attempt: boolean;
  whatsappMode: boolean;
  private readonly _fb = inject(FormBuilder);
  private readonly _socialNetworkService = inject(SocialNetworkPrivateService);
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);

  /** Validador de URL http(s) para redes que requieren enlace web. */
  private urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const urlPattern =
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
      const isValid = urlPattern.test(control.value);

      return isValid ? null : { invalidUrl: true };
    };
  }

  ngOnInit(): void {
    if (this.config.data) {
      this.socialMedia = this.config.data.socialMedia;
      this.businessSocialNetwork = this.config.data.businessSocialNetwork;
    }

    if (
      this.socialMedia.name === 'WhatsApp' ||
      this.socialMedia.name === 'Telegram'
    ) {
      this.socialMediaForm = this._fb.group({
        phone: ['', [Validators.required]],
      });
      this.whatsappMode = true;
    } else {
      this.socialMediaForm = this._fb.group({
        url: ['', [Validators.required, this.urlValidator()]],
      });
    }

    if (this.businessSocialNetwork) {
      if (this.socialMedia.name === 'WhatsApp') {
        this.socialMediaForm.patchValue({
          phone: this.businessSocialNetwork.phone,
        });
      } else {
        this.socialMediaForm.patchValue({
          url: this.businessSocialNetwork.url,
        });
      }
    }
  }

  get urlControl() {
    return this.socialMediaForm.get('url');
  }

  get isUrlInvalid() {
    return (
      this.urlControl?.invalid &&
      (this.urlControl?.dirty || this.urlControl?.touched)
    );
  }

  saveSocialMedia() {
    if (!this.socialMediaForm.valid || this.attempt) {
      return;
    }

    const messageKey = this.businessSocialNetwork
      ? 'confirmation.areYouSureYouWantToUpdateThisSocialNetwork'
      : 'confirmation.areYouSureYouWantToSaveThisSocialNetwork';
    const confirmRef = this._dialogService.open(ConfirmationModal, {
      width: '500px',
      style: { maxHeight: '80vh' },
      data: {
        message: this._translate.instant(messageKey),
        color: 'primary',
      },
      modal: true,
      draggable: false,
      resizable: false,
    });
    confirmRef.onClose.pipe(take(1)).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._submitSocialMedia();
      }
    });
  }

  private _submitSocialMedia(): void {
    if (this.attempt) {
      return;
    }
    this.attempt = true;

    if (this.businessSocialNetwork) {
      this._socialNetworkService
        .updateSocialNetworkBusiness({
          contact: {
            url: this.socialMediaForm.value?.url,
            phone: this.socialMediaForm.value?.phone,
          },
          id: this.businessSocialNetwork.id,
        })
        .subscribe({
          next: (response) => {
            this.ref.close(response);
            this.attempt = false;
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
        });
    } else {
      this._socialNetworkService
        .createSocialNetworkBusiness({
          contact: {
            url: this.socialMediaForm.value?.url,
            phone: this.socialMediaForm.value?.phone,
          },
          idSocialNetwork: this.socialMedia.id,
        })
        .subscribe({
          next: (response) => {
            this.ref.close(response);
            this.attempt = false;
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
        });
    }
  }
}
