import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AddSocialMediaModal, Button } from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-social-medias-page',
  imports: [CommonModule, Button, TranslateModule],
  templateUrl: './social-medias-page.html',
  styleUrl: './social-medias-page.scss',
})
export class SocialMediasPage {
  socialMedias = [
    {
      name: 'Facebook',
      icon: 'pi pi-facebook',
      username: 'facebook_username',
      url: 'https://www.facebook.com',
    },
    {
      name: 'Instagram',
      icon: 'pi pi-instagram',
      username: 'instagram_username',
      url: 'https://www.instagram.com',
    },
    {
      name: 'Twitter',
      icon: 'pi pi-twitter',
      username: 'twitter_username',
      url: 'https://www.twitter.com',
    },
    {
      name: 'TikTok',
      icon: 'pi pi-tiktok',
      username: 'tiktok_username',
      url: 'https://www.tiktok.com',
    },
  ];

  ref: DynamicDialogRef | undefined;
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);

  addSocialMediaModal(socialMedia: any) {
    this.ref = this._dialogService.open(AddSocialMediaModal, {
      header: this._translate.instant('general.addSocialMedia'),
      width: '600px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      inputValues: {
        socialMedia: socialMedia,
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
      }
    });
  }
}
