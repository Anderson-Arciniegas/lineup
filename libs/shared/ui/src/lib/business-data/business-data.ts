import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  BusinessPublicService,
  BusinessSchema,
  LocationSchema,
  SocialNetworkBusinessSchema,
  SocialNetworkPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChipModule } from 'primeng/chip';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
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
    TooltipModule,
  ],
  templateUrl: './business-data.html',
  styleUrl: './business-data.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BusinessData implements OnInit, OnChanges {
  @Input() business: BusinessSchema;
  @Input() myBusiness: boolean;
  ref: DynamicDialogRef;
  businessSocialNetworks: SocialNetworkBusinessSchema[] = [];
  attempt: boolean;
  following = false;
  followers = 0;
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _socialMediaService = inject(SocialNetworkPrivateService);
  private readonly _utilsService = inject(UtilsService);
  private readonly _sanitizer = inject(DomSanitizer);
  private readonly _businessPublicService = inject(BusinessPublicService);
  private _subscriptions = new Subscription();

  ngOnInit(): void {
    console.log(this.business);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes', changes);
    console.log(this.myBusiness);
    if (this.business) {
      this.followers = this.business.followers;
      this.isFollowingBusiness();
      this.getMySocialNetworkBusinesses();
    }
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
      this._socialMediaService.findByBusiness(this.business.id).subscribe({
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

  /**
   * Formatea el número de seguidores al estilo redes sociales:
   * - >= 1.000.000: 1 M, 2 M, 1.9 M (trunca a 1 decimal, sin redondear hacia arriba)
   * - >= 1.000: 1 m, 2 m, 999.9 m (trunca a 1 decimal, sin redondear hacia arriba)
   * - < 1.000: valor sin formatear
   */
  formatFollowers(count: number): string {
    if (count == null || count < 0) return '0';
    if (count >= 1_000_000) {
      const value = count / 1_000_000;
      const display = value % 1 === 0 ? value : Math.floor(value * 10) / 10;
      return `${display} M`;
    }
    if (count >= 1_000) {
      const value = count / 1_000;
      const display = value % 1 === 0 ? value : Math.floor(value * 10) / 10;
      return `${display} m`;
    }
    return String(count);
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

  isFollowingBusiness() {
    console.log('hola');
    this._subscriptions.add(
      this._businessPublicService.isFollowingBusiness(this.business.id).subscribe({
        next: (response) => {
          this.following = response;
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          console.log('Business is following');
        },
      }),
    );
  }

  followBusiness() {
    this.following = true;
    this._subscriptions.add(
      this._businessPublicService.followBusiness(this.business.id).subscribe({
        next: (response) => {
          console.log(response);
          this.following = true;
          this.followers++;
        },
        error: (error) => {
          console.error(error);
          this.following = false;
        },
        complete: () => {
          console.log('Business followed');
        },
      }),
    );
  }

  unfollowBusiness() {
    this.following = false;
    this._subscriptions.add(
      this._businessPublicService.unfollowBusiness(this.business.id).subscribe({
        next: (response) => {
          console.log(response);
          this.following = false;
          this.followers--;
        },
        error: (error) => {
          console.error(error);
          this.following = true;
        },
        complete: () => {
          console.log('Business unfollowed');
        },
      }),
    );
  }
}
