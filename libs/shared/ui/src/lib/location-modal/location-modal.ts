import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocationSchema } from '@lineup/core';
import { environment } from '@lineup/envs';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';
import { Button } from '../button/button';

interface LatLngLike {
  lat(): number;
  lng(): number;
}

interface GoogleMapsApi {
  Map: new (
    mapDiv: HTMLElement,
    opts?: object,
  ) => {
    setCenter(latLng: LatLngLike): void;
    setZoom(zoom: number): void;
  };
  Marker: new (opts?: { position?: LatLngLike; map?: unknown }) => {
    setPosition(position: LatLngLike): void;
    setMap(map: unknown): void;
  };
  LatLng: new (lat: number, lng: number) => LatLngLike;
}

interface GoogleMapsWindow {
  google?: { maps: GoogleMapsApi };
}

/**
 * Muestra una ubicación en mapa estático (Google Maps JS): carga script, marker y centro en coordenadas.
 */
@Component({
  selector: 'lib-location-modal',
  imports: [CommonModule, DialogModule, TranslateModule, Button],
  templateUrl: './location-modal.html',
  styleUrl: './location-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationModal implements OnInit {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly destroyRef = inject(DestroyRef);

  location = signal<LocationSchema | null>(null);
  isMapReady = signal(false);
  isMapLoading = signal(true);

  mapContainer = viewChild<ElementRef<HTMLElement>>('mapContainer');

  myLocation: boolean;

  private map: InstanceType<GoogleMapsApi['Map']> | null = null;
  private marker: InstanceType<GoogleMapsApi['Marker']> | null = null;

  private get mapsApiUrl(): string {
    const { GOOGLE_MAPS_API_URL, GOOGLE_MAPS_API_KEY } = environment.google;
    return `${GOOGLE_MAPS_API_URL}${GOOGLE_MAPS_API_KEY}`;
  }

  ngOnInit(): void {
    const dataLocation = this.config.data?.location as
      | LocationSchema
      | undefined;
    this.myLocation = this.config.data?.myLocation as boolean;
    if (!dataLocation) {
      this.isMapLoading.set(false);
      return;
    }

    this.location.set(dataLocation);
    this.loadGoogleMapsScript();
  }

  close(): void {
    this.ref.close();
  }

  editLocation(): void {
    this.ref.close({
      edit: true,
    });
  }

  deleteLocation(): void {
    this.ref.close({
      delete: true,
    });
  }

  openInGoogleMaps(): void {
    const currentLocation = this.location();
    if (!currentLocation) return;
    const url = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private loadGoogleMapsScript(): void {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as GoogleMapsWindow).google?.maps
    ) {
      setTimeout(() => this.initMap(), 0);
      return;
    }

    const script = document.createElement('script');
    script.src = this.mapsApiUrl;
    script.async = true;
    script.defer = true;

    fromEvent(script, 'load')
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          setTimeout(() => this.initMap(), 0);
        },
        error: () => {
          this.isMapLoading.set(false);
        },
      });

    document.head.appendChild(script);
  }

  private initMap(): void {
    const containerRef = this.mapContainer();
    const container = containerRef?.nativeElement;

    if (!container) {
      this.isMapLoading.set(false);
      return;
    }

    const g = (window as unknown as GoogleMapsWindow).google;
    if (!g?.maps) {
      this.isMapLoading.set(false);
      return;
    }

    const maps = g.maps;
    const currentLocation = this.location();

    if (!currentLocation) {
      this.isMapLoading.set(false);
      return;
    }

    const center = new maps.LatLng(currentLocation.lat, currentLocation.lng);

    this.map = new maps.Map(container, {
      center,
      zoom: 16,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      
    });

    this.marker = new maps.Marker({
      position: center,
      map: this.map,
    });

    this.isMapReady.set(true);
    this.isMapLoading.set(false);
  }
}
