/**
 * Declaraciones mínimas para la API de Google Maps cargada dinámicamente.
 */
declare global {
  namespace google {
    namespace maps {
  class Map {
    constructor(mapDiv: HTMLElement, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    addListener(eventName: string, handler: (e?: unknown) => void): MapsEventListener;
    getCenter(): LatLng;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(position: LatLng | LatLngLiteral): void;
    getPosition(): LatLng;
    setMap(map: Map | null): void;
    addListener(eventName: string, handler: (e?: unknown) => void): MapsEventListener;
  }

  class Geocoder {
    geocode(
      request: GeocoderRequest,
      callback: (results: GeocoderResult[], status: GeocoderStatus) => void
    ): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    zoomControl?: boolean;
  }

  interface MarkerOptions {
    position?: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    draggable?: boolean;
  }

  interface GeocoderRequest {
    location?: LatLng | LatLngLiteral;
    placeId?: string;
    address?: string;
  }

  interface GeocoderResult {
    geometry: { location: LatLng; location_type: string };
    address_components: GeocoderAddressComponent[];
    formatted_address: string;
    place_id: string;
  }

  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';

  interface MapsEventListener {
    remove(): void;
  }

  const event: {
    addListener(instance: object, eventName: string, handler: (e?: unknown) => void): MapsEventListener;
  };
    }
  }
}

export {};
