import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LocationSchema } from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Button } from '../button/button';
import { LocationModal } from '../location-modal/location-modal';

@Component({
  selector: 'lib-business-locations-modal',
  imports: [CommonModule, DialogModule, TranslateModule, Button],
  templateUrl: './business-locations-modal.html',
  styleUrl: './business-locations-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessLocationsModal {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly dialogService = inject(DialogService);
  private readonly translate = inject(TranslateService);

  readonly locations = signal<LocationSchema[]>([]);

  readonly businessName = computed(() => {
    const explicitName = this.config.data?.businessName as string | undefined;
    if (explicitName?.trim()) return explicitName.trim();

    return this.locations()[0]?.business?.name ?? '';
  });

  readonly title = computed(() => {
    const name = this.businessName();
    return name
      ? `${this.translate.instant('general.locationsOf')} ${name}`
      : this.translate.instant('general.locations');
  });

  constructor() {
    const dataLocations = this.config.data?.locations as
      | LocationSchema[]
      | undefined;

    this.locations.set(Array.isArray(dataLocations) ? [...dataLocations] : []);

    // Asignar el header en el constructor para que esté disponible antes del primer
    // ciclo de change detection de DynamicDialogComponent y evitar NG0100.
    this.config.header = this.title();
  }

  close(): void {
    this.ref.close();
  }

  openLocation(location: LocationSchema): void {
    this.dialogService.open(LocationModal, {
      header: this.translate.instant('general.location'),
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

    this.ref.close();
  }

  getShortAddress(address?: string | null): string {
    const value = (address ?? '').trim();
    if (!value) return '';
    return value.split(',').slice(0, 3).join(', ');
  }
}
