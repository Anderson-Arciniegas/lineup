import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { CurrencySymbolPipe, ProductSchema } from '@lineup/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Skeleton } from 'primeng/skeleton';
import { Button } from '../button/button';
import { ShareModal } from '../share-modal/share-modal';

@Component({
  selector: 'lib-catalog-carousel-item',
  imports: [CommonModule, Button, Skeleton, CurrencySymbolPipe],
  templateUrl: './catalog-carousel-item.html',
  styleUrl: './catalog-carousel-item.scss',
})
export class CatalogCarouselItem {
  @Input() product: ProductSchema;
  imageLoaded = false;
  ref: DynamicDialogRef | undefined;
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);

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
        url: `${window.location.origin}/${this.product.business.path}/${this.product.catalog.path}/${this.product.id}`,
      },
      modal: true,
      closable: true,
    });
  }
}
