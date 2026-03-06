export interface CreateLocationInput {
  address: string;
  formattedAddress: string;
  name: string;
  lat: number;
  lng: number;
}

export interface UpdateLocationInput {
  id: number;
  address: string;
  formattedAddress: string;
  name: string;
  lat: number;
  lng: number;
}
