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
  SocialNetworkSchema,
  SocialNetworkService,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { Button } from '../button/button';

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
  private readonly _socialNetworkService = inject(SocialNetworkService);
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

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

    console.log(this.businessSocialNetwork);
    console.log(this.socialMedia);

    if (this.socialMedia.name === 'WhatsApp') {
      this.socialMediaForm = this._fb.group({
        phone: ['', [Validators.required]],
      });
      this.whatsappMode = true;
    } else {
      this.socialMediaForm = this._fb.group({
        url: ['', [Validators.required, this.urlValidator()]],
      });
    }

    console.log(this.socialMedia);

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
    if (this.socialMediaForm.valid) {
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
              console.log(response);
              this.ref.close(response);
              this.attempt = false;
            },
            error: (error) => {
              console.error(error);
              this.attempt = false;
            },
            complete: () => {
              console.log('Social network business updated');
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
            complete: () => {
              console.log('Social network business created');
            },
          });
      }
    }
  }
}
