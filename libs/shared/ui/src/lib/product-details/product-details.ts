import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import {
  ProductSchema,
  SocialNetworkService,
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
export class ProductDetails implements OnInit {
  @Input() product: ProductSchema;
  businessSocialNetworks: SocialNetworkBusinessSchema[] = [];
  attempt: boolean;
  ref: DynamicDialogRef | undefined;
  colors = [
    { name: 'Red', primary: false },
    { name: 'Blue', primary: false },
    { name: 'Green', primary: true },
    { name: 'Yellow', primary: false },
  ];

  sizes = [
    { name: 'S', primary: false },
    { name: 'M', primary: false },
    { name: 'L', primary: true },
    { name: 'XL', primary: false },
  ];

  shipping = [
    { name: 'Delivery', primary: false },
    { name: 'MRW', primary: false },
    { name: 'Zoom', primary: true },
  ];

  variations = [
    { title: 'Color', variations: this.colors },
    { title: 'Size', variations: this.sizes },
    { title: 'Shipping', variations: this.shipping },
  ];

  href =
    'https://api.whatsapp.com/send?phone=584244124890&text=Hola%20quiero%20informacion%20del%20producto%20Laptop%20Gamer%20ASUS';

  private readonly _socialMediaService = inject(SocialNetworkService);
  private readonly _messageService = inject(MessageService);
  private readonly _utilsService = inject(UtilsService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);

  private _subscriptions = new Subscription();

  ngOnInit(): void {
    //variations
    console.log(this.product.variations);
    this.getMySocialNetworkBusinesses();
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
            const phone = this.businessSocialNetworks
              .find((socialNetwork) => socialNetwork.phone)
              .phone.trim();
            console.log(phone);
            this.href = this._utilsService.formatWhatsappPhone(
              phone,
              `Hola%20estoy%20interesado%20en%20este%20producto:%20${location.href}`,
            );
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
}
