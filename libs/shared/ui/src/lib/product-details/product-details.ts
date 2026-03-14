import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  AuthStore,
  ProductSchema,
  SocialNetworkService,
  UserService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SocialNetworkBusinessSchema } from 'libs/shared/core/src/lib/schemas/social-network-business.schema';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { Subscription } from 'rxjs';
import { Button } from '../button/button';
import { ProductVariations } from '../product-variations/product-variations';
import { ShareModal } from '../share-modal/share-modal';

@Component({
  selector: 'lib-product-details',
  imports: [
    CommonModule,
    Button,
    PanelModule,
    MenuModule,
    ProductVariations,
    TranslateModule,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
  providers: [MessageService],
})
export class ProductDetails implements OnInit, OnChanges {
  @Input() product: ProductSchema;
  businessSocialNetworks: SocialNetworkBusinessSchema[] = [];
  attempt: boolean;
  ref: DynamicDialogRef | undefined;
  hasLiked = false;
  href: string;

  private readonly _socialMediaService = inject(SocialNetworkService);
  private readonly _messageService = inject(MessageService);
  private readonly _utilsService = inject(UtilsService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _userService = inject(UserService);
  private readonly _subscription = new Subscription();

  ngOnInit(): void {
    //variations
    console.log(this.product.variations);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.product) {
      this.getSocialNetworkBusinesses();
      this.hasLikedProduct();
    }
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

  getSocialNetworkBusinesses() {
    this.attempt = true;
    this._subscription.add(
      this._socialMediaService
        .findByBusiness(this.product.business.id)
        .subscribe({
          next: (socialNetworkBusinesses) => {
            console.log(socialNetworkBusinesses);
            if (socialNetworkBusinesses.length > 0) {
              this.businessSocialNetworks = socialNetworkBusinesses;
              if (
                this.businessSocialNetworks &&
                this.businessSocialNetworks.find(
                  (socialNetwork) => socialNetwork.phone,
                )
              ) {
                const phone = this.businessSocialNetworks
                  .find((socialNetwork) => socialNetwork.phone)
                  .phone.trim();
                console.log(phone);
                this.href = this._utilsService.formatWhatsappPhone(
                  phone,
                  `Hola%20estoy%20interesado%20en%20este%20producto:%20${location.href}`,
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

  likeProduct(): void {
    if (this.hasLiked || this._authStore.isBusinessLoggedIn()) return;
    this.hasLiked = true;
    this._subscription.add(
      this._userService.likeProduct(this.product.id).subscribe({
        next: (response) => {
          console.log(response);
          this.hasLiked = true;
        },
        error: (error) => {
          console.error(error);
          this.hasLiked = false;
        },
        complete: () => {
          console.log('Product liked');
        },
      }),
    );
  }

  unlikeProduct(): void {
    if (!this.hasLiked || this._authStore.isBusinessLoggedIn()) return;
    this.hasLiked = false;
    this._subscription.add(
      this._userService.unlikeProduct(this.product.id).subscribe({
        next: (response) => {
          console.log(response);
          this.hasLiked = false;
        },
        error: (error) => {
          console.error(error);
          this.hasLiked = true;
        },
        complete: () => {
          console.log('Product unliked');
        },
      }),
    );
  }

  hasLikedProduct(): void {
    if (this._authStore.isBusinessLoggedIn()) return;
    this._subscription.add(
      this._userService.hasLikedProduct(this.product.id).subscribe({
        next: (response) => {
          console.log(response);
          this.hasLiked = response;
        },
      }),
    );
  }
}
