import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { Button } from '../button/button';
import { CreateCatalogModal } from '../create-catalog-modal/create-catalog-modal';

@Component({
  selector: 'lib-create-catalog-card',
  imports: [
    CommonModule,
    CardModule,
    TranslateModule,
    DialogModule,
    ButtonModule,
    IftaLabelModule,
    FormsModule,
    Button,
  ],
  templateUrl: './create-catalog-card.html',
  styleUrl: './create-catalog-card.scss',
})
export class CreateCatalogCard {
  @Input() width = 'w-72';
  @Input() height = 'h-96';
  ref: DynamicDialogRef | undefined;
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);

  createCatalog() {
    this.ref = this._dialogService.open(CreateCatalogModal, {
      header: this._translate.instant('general.createCatalog'),
      width: '500px',
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

    this.ref.onClose.subscribe((catalog: any) => {
      if (catalog) {
        console.log(catalog);
      }
    });
  }
}
