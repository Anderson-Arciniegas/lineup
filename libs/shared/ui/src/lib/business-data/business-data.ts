import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  BusinessSchema,
  LocationSchema,
  SocialNetworkBusinessSchema,
  SocialNetworkService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChipModule } from 'primeng/chip';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { Subscription } from 'rxjs';
import { BusinessLocationsModal } from '../business-locations-modal/business-locations-modal';
import { Button } from '../button/button';
import { LocationModal } from '../location-modal/location-modal';
import { ShareModal } from '../share-modal/share-modal';
@Component({
  selector: 'lib-business-data',
  imports: [
    CommonModule,
    TagModule,
    Button,
    TranslateModule,
    SkeletonModule,
    ChipModule,
  ],
  templateUrl: './business-data.html',
  styleUrl: './business-data.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BusinessData implements OnInit {
  @Input() business: BusinessSchema;
  @Input() myBusiness: boolean;
  ref: DynamicDialogRef;
  businessSocialNetworks: SocialNetworkBusinessSchema[] = [];
  attempt: boolean;
  following = false;
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _socialMediaService = inject(SocialNetworkService);
  private readonly _utilsService = inject(UtilsService);
  private readonly _sanitizer = inject(DomSanitizer);
  private _subscriptions = new Subscription();

  ngOnInit(): void {
    this.getMySocialNetworkBusinesses();
  }

  getDescription() {
    return this._sanitizer.bypassSecurityTrustHtml(
      this.business?.description ?? '',
    );
  }

  getSocialNetworkUrl(id: number) {
    const socialNetwork = this.businessSocialNetworks.find(
      (socialNetwork) => Number(socialNetwork.socialNetwork.id) === Number(id),
    );

    if (socialNetwork?.url) {
      return socialNetwork.url;
    } else if (socialNetwork?.phone) {
      const href = this._utilsService.formatWhatsappPhone(
        socialNetwork?.phone,
        'Hola',
      );

      return href;
    } else {
      return '';
    }
  }

  getMySocialNetworkBusinesses() {
    this.attempt = true;
    this._subscriptions.add(
      this._socialMediaService.findAllMySocialNetworkBusinesses().subscribe({
        next: (socialNetworkBusinesses) => {
          console.log(socialNetworkBusinesses);
          if (socialNetworkBusinesses.length > 0) {
            this.businessSocialNetworks = socialNetworkBusinesses;
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

  share() {
    this.ref = this._dialogService.open(ShareModal, {
      header: this._translate.instant('general.share'),
      width: '500px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        url: location.href,
      },
      modal: true,
      closable: true,
    });
  }

  getAddress(address: string): string {
    return address.split(',').slice(0, 2).join(', ');
  }

  openLocationsModal() {
    this.ref = this._dialogService.open(BusinessLocationsModal, {
      width: '520px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        locations: this.business?.locations ?? [],
        businessName: this.business?.name,
      },
      modal: true,
      closable: true,
    });
  }

  openLocationModal(location: LocationSchema) {
    this.ref = this._dialogService.open(LocationModal, {
      header:
        this._translate.instant('general.locationOf') +
        ' ' +
        this.business?.name,
      width: '600px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        location,
        myLocation: false,
      },
      modal: true,
      closable: true,
    });
  }
}
