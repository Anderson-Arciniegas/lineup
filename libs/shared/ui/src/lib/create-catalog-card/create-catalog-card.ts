import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppConfigService, BusinessSchema, UtilsService } from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { Button } from '../button/button';

/**
 * Tarjeta que lleva al flujo de creación de catálogo en el panel del negocio (`UtilsService.navigate`).
 */
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
  ],
  templateUrl: './create-catalog-card.html',
  styleUrl: './create-catalog-card.scss',
})
export class CreateCatalogCard {
  @Input() business: BusinessSchema;
  @Input() width = 'w-72';
  @Input() height = 'h-96';
  ref: DynamicDialogRef | undefined;
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _utils = inject(UtilsService);

  /** Navega a la ruta configurada de alta de catálogo en el dashboard. */
  createCatalog() {
    this._utils.navigate([
      AppConfigService.config.routes.dashboard,
      AppConfigService.config.routes.catalogs,
      AppConfigService.config.routes.createCatalog,
    ]);
    // this.ref = this._dialogService.open(CreateCatalogModal, {
    //   header: this._translate.instant('general.createCatalog'),
    //   width: '500px',
    //   style: { maxHeight: '80vh' },
    //   breakpoints: {
    //     '640px': '450px',
    //     '500px': '80vw',
    //     '400px': '90vw',
    //   },
    //   dismissableMask: true,
    //   modal: true,
    //   draggable: false,
    //   resizable: false,
    //   closable: true,
    // });

    // this.ref.onClose.subscribe((catalog: any) => {
    //   if (catalog) {
    //     console.log(catalog);
    //   }
    // });
  }
}
