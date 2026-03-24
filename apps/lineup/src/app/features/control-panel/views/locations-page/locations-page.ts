import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AuthStore,
  BusinessSchema,
  LocationSchema,
  LocationsPrivateService,
} from '@lineup/core';
import {
  AddLocationModal,
  Button,
  ConfirmationModal,
  LocationModal,
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-locations-page',
  imports: [
    CommonModule,
    TranslateModule,
    Button,
    ProgressSpinner,
  ],
  templateUrl: './locations-page.html',
  styleUrl: './locations-page.scss',
})
export class LocationsPage implements OnInit {
  business: BusinessSchema;
  locations: LocationSchema[] = [];
  attempt = false;
  ref: DynamicDialogRef | undefined;

  private readonly _dialogService = inject(DialogService);
  private readonly _authStore = inject(AuthStore);
  private readonly _translate = inject(TranslateService);
  private readonly _locationsService = inject(LocationsPrivateService);

  private _subscriptions = new Subscription();

  ngOnInit(): void {
    this.business = this._authStore.business();
    this.getLocations();
  }

  getAddress(address: string): string {
    return address.split(',').slice(0, 2).join(', ');
  }

  getLocations(): void {
    if (this.attempt) return;
    this.attempt = true;
    this._subscriptions.add(
      this._locationsService.findAllMyLocations().subscribe({
        next: (response) => {
          this.locations = [...response];
          console.log(this.locations);
          this.attempt = false;
        },
        error: (error) => {
          console.error(error);
          this.attempt = false;
        },
        complete: () => {
          console.log('Locations fetched');
        },
      }),
    );
  }

  openLocationModal(location: LocationSchema) {
    this.ref = this._dialogService.open(LocationModal, {
      header: this._translate.instant('general.location'),
      width: '600px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        location,
        myLocation: true,
      },
      modal: true,
      closable: true,
    });

    this.ref.onClose.subscribe((response: any) => {
      if (response.edit) {
        this.addLocationModal(location);
      } else if (response.delete) {
        this.deleteLocation(location);
      }
    });
  }

  addLocationModal(location?: LocationSchema) {
    this.ref = this._dialogService.open(AddLocationModal, {
      header: this._translate.instant(
        location ? 'general.editLocation' : 'general.addLocation',
      ),
      width: '600px',
      style: { maxHeight: '90vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        location: location,
      },
      modal: true,

      closable: true,
    });

    this.ref.onClose.subscribe((response: LocationSchema | undefined) => {
      if (response) {
        console.log(response);
        if (location) {
          const index = this.locations.findIndex(
            (loc) => loc.id === location.id,
          );
          if (index !== -1) {
            this.locations = [
              ...this.locations.slice(0, index),
              response,
              ...this.locations.slice(index + 1),
            ];
          } else {
            this.locations = [...this.locations, response];
          }
        } else {
          this.locations = [...this.locations, response];
        }
      }
    });
  }

  deleteLocation(location: LocationSchema) {
    this.ref = this._dialogService.open(ConfirmationModal, {
      width: '500px',
      data: {
        message: this._translate.instant(
          'confirmation.doYouWantToDeleteThisLocation',
        ),
        color: 'danger',
      },
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
    });

    this.ref.onClose.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._subscriptions.add(
          this._locationsService.removeLocation(location.id).subscribe({
            next: (response) => {
              console.log(response);
              this.locations = this.locations.filter(
                (loc) => loc.id !== location.id,
              );
            },
            error: (error) => {
              console.error(error);
            },
            complete: () => {
              console.log('Location deleted');
            },
          }),
        );
      }
    });
  }
}
