import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LocationSchema, LocationsPrivateService } from '@lineup/core';
import { environment } from '@lineup/envs';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { fromEvent, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Button } from '../button/button';

/** Tipos locales para la API de Google Maps (evitan depender del global `google`). */
interface LatLngLike {
  lat(): number;
  lng(): number;
}

interface GeocoderResultLike {
  formatted_address: string;
  geometry?: { location: LatLngLike };
}

/** Predicción del autocompletado de Places. */
interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: { main_text: string; secondary_text?: string };
}

/** Resultado de getDetails de un lugar. */
interface PlaceResultLike {
  geometry?: { location: LatLngLike };
  formatted_address?: string;
}

/** API de Places (AutocompleteService, PlacesService). */
interface GoogleMapsPlacesApi {
  AutocompleteService: new () => {
    getPlacePredictions(
      request: { input: string },
      callback: (predictions: PlacePrediction[] | null, status: string) => void,
    ): void;
  };
  PlacesService: new (map: unknown) => {
    getDetails(
      request: { placeId: string },
      callback: (place: PlaceResultLike | null, status: string) => void,
    ): void;
  };
}

interface GoogleMapsApi {
  Map: new (
    mapDiv: HTMLElement,
    opts?: object,
  ) => {
    setCenter(latLng: LatLngLike): void;
    setZoom(zoom: number): void;
    addListener(
      eventName: string,
      handler: (e?: { latLng: LatLngLike }) => void,
    ): void;
  };
  Marker: new (opts?: object) => {
    setPosition(position: LatLngLike): void;
    getPosition(): LatLngLike;
    setMap(map: unknown): void;
    addListener(eventName: string, handler: () => void): void;
  };
  Geocoder: new () => {
    geocode(
      request: object,
      callback: (results: GeocoderResultLike[], status: string) => void,
    ): void;
  };
  LatLng: new (lat: number, lng: number) => LatLngLike;
  places?: GoogleMapsPlacesApi;
}

interface GoogleMapsWindow {
  google?: { maps: GoogleMapsApi };
}

export interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
  formattedAddress?: string;
}

/**
 * Alta/edición de ubicación con autocompletado Places, mapa interactivo y geocodificación inversa
 * para persistir coordenadas y dirección formateada.
 */
@Component({
  selector: 'lib-add-location-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    FormsModule,
    TranslateModule,
    Button,
    InputTextModule,
    IconField,
    InputIcon,
  ],
  templateUrl: './add-location-modal.html',
  styleUrl: './add-location-modal.scss',
})
export class AddLocationModal implements OnInit {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly destroyRef = inject(DestroyRef);
  private readonly locationsService = inject(LocationsPrivateService);

  mapContainer = viewChild<ElementRef<HTMLElement>>('mapContainer');
  selectedLocation = signal<SelectedLocation | null>(null);
  isMapReady = signal(false);
  isMapLoading = signal(true);
  isLoadingGeolocation = signal(false);
  geolocationError = signal<string | null>(null);

  /** Nombre de la ubicación (requerido). */
  locationName = signal('');
  /** Si el usuario ya interactuó con el campo nombre (para mostrar error). */
  nameTouched = signal(false);

  /** Texto del input de búsqueda de lugares. */
  searchQuery = signal('');
  /** Lista de sugerencias de Places (flotante sobre el mapa). */
  placePredictions = signal<PlacePrediction[]>([]);
  attempt: boolean;

  /** Location a editar (recibida por config.data.location). Si existe, el modal está en modo edición. */
  readonly locationToEdit = this.config.data?.location as
    | LocationSchema
    | undefined;
  readonly isEditMode = !!this.locationToEdit;

  /** Longitud máxima permitida para el nombre de la ubicación. */
  static readonly MAX_LOCATION_NAME_LENGTH = 25;

  /** Nombre sin espacios en blanco; usado para validación y para deshabilitar guardar. */
  locationNameTrimmed = () => this.locationName().trim().length > 0;

  /** True si el nombre (trimmed) supera la longitud máxima. */
  locationNameExceedsMax = () =>
    this.locationName().trim().length >
    AddLocationModal.MAX_LOCATION_NAME_LENGTH;

  /** Nombre válido: no vacío y no excede la longitud máxima. */
  locationNameValid = () =>
    this.locationNameTrimmed() && !this.locationNameExceedsMax();

  onNameInput(value: string): void {
    this.locationName.set(value);
  }

  private map: InstanceType<GoogleMapsApi['Map']> | null = null;
  private marker: InstanceType<GoogleMapsApi['Marker']> | null = null;
  private geocoder: InstanceType<GoogleMapsApi['Geocoder']> | null = null;
  private autocompleteService: InstanceType<
    GoogleMapsPlacesApi['AutocompleteService']
  > | null = null;
  private placesService: InstanceType<
    GoogleMapsPlacesApi['PlacesService']
  > | null = null;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private blurCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly SEARCH_DEBOUNCE_MS = 300;
  private static readonly BLUR_CLOSE_DELAY_MS = 180;

  /**
   * Obtiene la ubicación inicial: la location a editar (config.data.location) o initialLocation (config.data.initialLocation).
   */
  private getInitialLocation():
    | {
        lat: number;
        lng: number;
        address?: string;
        formattedAddress?: string;
      }
    | undefined {
    if (this.locationToEdit?.lat != null && this.locationToEdit?.lng != null) {
      return {
        lat: this.locationToEdit.lat,
        lng: this.locationToEdit.lng,
        address:
          this.locationToEdit.address ?? this.locationToEdit.formattedAddress,
        formattedAddress: this.locationToEdit.formattedAddress,
      };
    }
    return this.config.data?.initialLocation as
      | {
          lat: number;
          lng: number;
          address?: string;
          formattedAddress?: string;
        }
      | undefined;
  }

  private get mapsApiUrl(): string {
    const { GOOGLE_MAPS_API_URL, GOOGLE_MAPS_API_KEY } = environment.google;
    return `${GOOGLE_MAPS_API_URL}${GOOGLE_MAPS_API_KEY}&libraries=places`;
  }

  private _subscriptions = new Subscription();

  ngOnInit(): void {
    this.loadGoogleMapsScript();
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
          this.geolocationError.set('locationModal.mapLoadError');
        },
      });

    document.head.appendChild(script);
  }

  private initMap(): void {
    const containerEl = this.mapContainer();
    const container = containerEl?.nativeElement;
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

    const defaultCenter = { lat: 10.4806, lng: -66.9036 };
    this.map = new maps.Map(container, {
      center: defaultCenter,
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    this.marker = new maps.Marker({
      position: defaultCenter,
      map: this.map,
      draggable: true,
    });

    this.geocoder = new maps.Geocoder();

    if (maps.places) {
      this.autocompleteService = new maps.places.AutocompleteService();
      this.placesService = new maps.places.PlacesService(this.map);
    }

    this.map.addListener('click', (e: { latLng: LatLngLike }) => {
      this.updatePosition(e.latLng);
    });

    this.marker.addListener('dragend', () => {
      const pos = this.marker?.getPosition();
      if (pos) {
        this.updatePosition(pos);
      }
    });

    const initialLocation = this.getInitialLocation();
    if (this.locationToEdit?.name != null) {
      this.locationName.set(this.locationToEdit.name);
    }
    if (initialLocation?.lat != null && initialLocation?.lng != null) {
      const latLng = new maps.LatLng(initialLocation.lat, initialLocation.lng);
      this.map.setCenter(latLng);
      this.marker.setPosition(latLng);
      const address = initialLocation.address ?? '';
      this.searchQuery.set(address);
      this.selectedLocation.set({
        lat: initialLocation.lat,
        lng: initialLocation.lng,
        address,
        formattedAddress: initialLocation.formattedAddress ?? address,
      });
    } else {
      this.trySetDefaultToCurrentLocation(maps);
    }

    this.isMapReady.set(true);
    this.isMapLoading.set(false);
  }

  /**
   * Intenta usar la ubicación actual del dispositivo como valor por defecto.
   * Si no hay permiso o falla, el mapa se queda en el centro por defecto (Caracas).
   */
  private trySetDefaultToCurrentLocation(maps: GoogleMapsApi): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (this.map && this.marker) {
          const latLng = new maps.LatLng(lat, lng);
          this.map.setCenter(latLng);
          this.map.setZoom(16);
          this.updatePosition(latLng);
        }
      },
      () => {
        // Sin permiso o error: se mantiene el centro por defecto (Caracas), sin ubicación seleccionada
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  private updatePosition(latLng: LatLngLike): void {
    const lat = latLng.lat();
    const lng = latLng.lng();
    this.marker?.setPosition(latLng);
    this.reverseGeocode(lat, lng);
  }

  private reverseGeocode(lat: number, lng: number): void {
    if (!this.geocoder) return;

    this.geocoder.geocode(
      { location: { lat, lng } },
      (results: GeocoderResultLike[], status: string) => {
        const address =
          status === 'OK' && results?.[0]
            ? results[0].formatted_address
            : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        this.searchQuery.set(address);
        this.selectedLocation.set({
          lat,
          lng,
          address,
          formattedAddress: address,
        });
      },
    );
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    if (this.searchDebounceTimer != null) {
      clearTimeout(this.searchDebounceTimer);
    }
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      this.placePredictions.set([]);
      return;
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.searchDebounceTimer = null;
      this.fetchPredictions(trimmed);
    }, AddLocationModal.SEARCH_DEBOUNCE_MS);
  }

  /**
   * Al pulsar Enter en el input de búsqueda: si hay sugerencias se elige la primera;
   * si no, se geocodifica el texto (dirección o Plus Code) y se establece como ubicación si se encuentra.
   * @param inputValue valor actual del input (se pasa desde el template para evitar desfase con el signal).
   */
  onSearchSubmit(inputValue?: string): void {
    const predictions = this.placePredictions();
    if (predictions.length > 0) {
      this.onSelectPlace(predictions[0]);
      return;
    }
    const query = (inputValue ?? this.searchQuery()).trim();
    if (query) {
      this.geocodeSearchQuery(query);
    }
  }

  /**
   * Geocodifica el texto (dirección o Plus Code p. ej. "528P+PP6, Valencia 2003, Carabobo")
   * y, si Maps encuentra un resultado, lo establece como ubicación seleccionada.
   */
  private geocodeSearchQuery(query: string): void {
    if (!this.geocoder || !this.map || !this.marker) return;

    this.geocoder.geocode(
      { address: query },
      (results: GeocoderResultLike[], status: string) => {
        if (status !== 'OK' || !results?.[0]?.geometry?.location) return;
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();
        const address = results[0].formatted_address ?? query;
        const g = (window as unknown as GoogleMapsWindow).google;
        if (!g?.maps) return;
        const latLng = new g.maps.LatLng(lat, lng);
        this.map.setCenter(latLng);
        this.map.setZoom(16);
        this.marker.setPosition(latLng);
        this.selectedLocation.set({
          lat,
          lng,
          address,
          formattedAddress: address,
        });
        this.searchQuery.set(address);
        this.placePredictions.set([]);
      },
    );
  }

  private fetchPredictions(input: string): void {
    if (!this.autocompleteService) {
      this.placePredictions.set([]);
      return;
    }
    this.autocompleteService.getPlacePredictions(
      { input },
      (predictions, status) => {
        if (status === 'OK' && predictions?.length) {
          this.placePredictions.set(predictions);
        } else {
          this.placePredictions.set([]);
        }
      },
    );
  }

  onSelectPlace(prediction: PlacePrediction): void {
    this.placePredictions.set([]);
    if (!this.placesService || !this.map || !this.marker) return;

    this.placesService.getDetails(
      { placeId: prediction.place_id },
      (place, status) => {
        if (status !== 'OK' || !place?.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const g = (window as unknown as GoogleMapsWindow).google;
        if (!g?.maps) return;
        const latLng = new g.maps.LatLng(lat, lng);
        this.map.setCenter(latLng);
        this.map.setZoom(16);
        this.updatePosition(latLng);
        const address = place.formatted_address ?? prediction.description;
        this.searchQuery.set(address);
        this.selectedLocation.set({
          lat,
          lng,
          address,
          formattedAddress: address,
        });
      },
    );
  }

  closePredictions(): void {
    this.cancelClosePredictions();
    this.placePredictions.set([]);
  }

  /** Cierra la lista de sugerencias tras un breve retraso (para permitir click en un ítem). */
  scheduleClosePredictions(): void {
    if (this.blurCloseTimer) clearTimeout(this.blurCloseTimer);
    this.blurCloseTimer = setTimeout(() => {
      this.placePredictions.set([]);
      this.blurCloseTimer = null;
    }, AddLocationModal.BLUR_CLOSE_DELAY_MS);
  }

  cancelClosePredictions(): void {
    if (this.blurCloseTimer) {
      clearTimeout(this.blurCloseTimer);
      this.blurCloseTimer = null;
    }
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.geolocationError.set('locationModal.geolocationNotSupported');
      return;
    }

    this.isLoadingGeolocation.set(true);
    this.geolocationError.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const g = (window as unknown as GoogleMapsWindow).google;
        if (g?.maps && this.map && this.marker) {
          const latLng = new g.maps.LatLng(lat, lng);
          this.map.setCenter(latLng);
          this.map.setZoom(16);
          this.updatePosition(latLng);
        }
        this.isLoadingGeolocation.set(false);
      },
      (error) => {
        this.isLoadingGeolocation.set(false);
        const messageKey =
          error.code === 1
            ? 'locationModal.permissionDenied'
            : error.code === 2
              ? 'locationModal.positionUnavailable'
              : 'locationModal.geolocationError';
        this.geolocationError.set(messageKey);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  confirm(): void {
    this.nameTouched.set(true);
    const nameTrimmed = this.locationName().trim();
    if (
      this.attempt ||
      !this.selectedLocation() ||
      !nameTrimmed ||
      nameTrimmed.length > AddLocationModal.MAX_LOCATION_NAME_LENGTH
    )
      return;
    this.attempt = true;
    const selected = this.selectedLocation();
    if (!selected) return;

    const payload = {
      address: selected.address,
      formattedAddress: selected.formattedAddress ?? selected.address,
      name: nameTrimmed,
      lat: selected.lat,
      lng: selected.lng,
    };

    if (this.isEditMode && this.locationToEdit?.id != null) {
      this._subscriptions.add(
        this.locationsService
          .updateLocation({
            id: this.locationToEdit.id,
            ...payload,
          })
          .subscribe({
            next: (response) => {
              this.ref.close(response);
              this.attempt = false;
            },
            error: (error) => {
              console.error(error);
              this.attempt = false;
            },
          }),
      );
    } else {
      this._subscriptions.add(
        this.locationsService.createLocation(payload).subscribe({
          next: (response) => {
            this.ref.close(response);
            this.attempt = false;
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
        }),
      );
    }
  }

  cancel(): void {
    this.ref.close(null);
  }
}
