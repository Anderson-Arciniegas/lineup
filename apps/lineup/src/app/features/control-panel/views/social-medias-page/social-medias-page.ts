import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  SocialNetworkBusinessSchema,
  SocialNetworkService,
  UtilsService,
} from '@lineup/core';
import { AddSocialMediaModal, Button, ConfirmationModal } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SocialNetworkSchema } from 'libs/shared/core/src/lib/schemas/social-network.schema';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-social-medias-page',
  imports: [
    CommonModule,
    Button,
    TranslateModule,
    ProgressSpinner,
  ],
  templateUrl: './social-medias-page.html',
  styleUrl: './social-medias-page.scss',
})
export class SocialMediasPage implements OnInit {
  socialMedias: SocialNetworkSchema[] = [];
  businessSocialNetworks: SocialNetworkBusinessSchema[] = [];
  attempt: boolean;
  attemptDelete: boolean;
  ref: DynamicDialogRef | undefined;
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _socialMediaService = inject(SocialNetworkService);
  private readonly _messageService = inject(MessageService);
  private readonly _utilsService = inject(UtilsService);
  private _subscriptions = new Subscription();

  ngOnInit(): void {
    this.getMySocialNetworkBusinesses();
    this.getSocialNetworks();
  }

  getSocialNetworkUrl(id: number) {
    const socialNetwork = this.businessSocialNetworks.find(
      (socialNetwork) => Number(socialNetwork.socialNetwork.id) === Number(id),
    );
    return socialNetwork
      ? socialNetwork.url
        ? socialNetwork.url
        : socialNetwork.phone
      : '';
  }

  getMySocialNetworkBusinesses() {
    this.attempt = true;
    this._subscriptions.add(
      this._socialMediaService.findAllMySocialNetworkBusinesses().subscribe({
        next: (socialNetworkBusinesses) => {
          console.log(socialNetworkBusinesses);
          if (socialNetworkBusinesses.length > 0) {
            this.businessSocialNetworks = socialNetworkBusinesses;
            if (this.socialMedias.length > 0) {
              this.socialMedias.sort((a, b) =>
                this.getSocialNetworkUrl(b.id).localeCompare(
                  this.getSocialNetworkUrl(a.id),
                ),
              );
            }
          } else {
            this.businessSocialNetworks = [];
          }
          this.attempt = false;
        },
        error: (error) => {
          console.error(error);
          this.attempt = false;
        },
        complete: () => {
          console.log('Social network businesses fetched');
        },
      }),
    );
  }

  getSocialNetworks() {
    this.attempt = true;
    this._subscriptions.add(
      this._socialMediaService.getSocialNetworks().subscribe({
        next: (socialNetworks) => {
          console.log(socialNetworks);
          if (socialNetworks.length > 0) {
            this.socialMedias = [...socialNetworks];
            if (this.businessSocialNetworks.length > 0) {
              this.socialMedias.sort((a, b) =>
                this.getSocialNetworkUrl(b.id).localeCompare(
                  this.getSocialNetworkUrl(a.id),
                ),
              );
            }
          } else {
            this.socialMedias = [];
          }
          this.attempt = false;
        },
        error: (error) => {
          console.error(error);
          this.attempt = false;
        },
        complete: () => {
          console.log('Social networks fetched');
        },
      }),
    );
  }

  addSocialMediaModal(socialMedia: SocialNetworkSchema) {
    const businessSocialNetwork = this.businessSocialNetworks.find(
      (businessSocialNetwork) =>
        businessSocialNetwork.socialNetwork.id === socialMedia.id,
    );

    this.ref = this._dialogService.open(AddSocialMediaModal, {
      header: this._translate.instant('general.addSocialMedia'),
      width: '600px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        socialMedia: socialMedia,
        businessSocialNetwork: businessSocialNetwork,
      },
      dismissableMask: true,
      modal: true,
      draggable: false,
      resizable: false,
      closable: true,
    });

    this.ref.onClose.subscribe((newSocialMedia: any) => {
      if (newSocialMedia) {
        console.log(newSocialMedia);
        this.getMySocialNetworkBusinesses();
        if (businessSocialNetwork) {
          this._messageService.add({
            severity: 'success',
            summary: this._translate.instant('general.success'),
            detail: this._translate.instant(
              'toast.socialNetworkBusinessUpdatedSuccessfully',
            ),
            life: 3000,
          });
        } else {
          this._messageService.add({
            severity: 'success',
            summary: this._translate.instant('general.success'),
            detail: this._translate.instant(
              'toast.socialNetworkBusinessCreatedSuccessfully',
            ),
            life: 3000,
          });
        }
      }
    });
  }

  deleteSocialNetwork(socialMedia: SocialNetworkSchema) {
    this.ref = this._dialogService.open(ConfirmationModal, {
      width: '500px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        message: this._translate.instant(
          'confirmation.doYouWantToDeleteThisSocialNetwork',
        ),
        color: 'danger',
      },
      modal: true,
      draggable: false,
      resizable: false,
    });

    this.ref.onClose.subscribe((confirmed: boolean) => {
      if (confirmed) {
        console.log(confirmed);
        const id = this.businessSocialNetworks.find(
          (socialNetwork) =>
            Number(socialNetwork.socialNetwork.id) === Number(socialMedia.id),
        )?.id;
        if (this.attemptDelete) return;
        this.attemptDelete = true;
        this._subscriptions.add(
          this._socialMediaService.removeSocialNetworkBusiness(id).subscribe({
            next: (response) => {
              console.log(response);
              this.getMySocialNetworkBusinesses();
              this.attemptDelete = false;
              this._messageService.add({
                severity: 'success',
                summary: this._translate.instant('general.success'),
                detail: this._translate.instant(
                  'toast.socialNetworkBusinessDeletedSuccessfullySocial',
                ),
                life: 3000,
              });
            },
            error: (error) => {
              console.error(error);
              this.attemptDelete = false;
            },
            complete: () => {
              console.log('Social network business deleted');
            },
          }),
        );
      }
    });
  }
}
