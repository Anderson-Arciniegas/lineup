import { inject, Injectable } from '@angular/core';
import {
  CREATE_LOCATION_MUTATION,
  FIND_ALL_MY_LOCATIONS_QUERY,
  FIND_ONE_LOCATION_QUERY,
  REMOVE_LOCATION_MUTATION,
  UPDATE_LOCATION_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type {
  CreateLocationInput,
  UpdateLocationInput,
} from '../../models/location.model';
import type { LocationSchema } from '../../schemas';

@Injectable({
  providedIn: 'root',
})
export class LocationsPrivateService {
  private apollo = inject(Apollo);

  findAllMyLocations(): Observable<LocationSchema[]> {
    return this.apollo
      .use('businessAPI')
      .query<{ findAllMyLocations: LocationSchema[] }>({
        query: FIND_ALL_MY_LOCATIONS_QUERY,
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findAllMyLocations));
  }

  findOneLocation(id: number): Observable<LocationSchema> {
    return this.apollo
      .use('businessAPI')
      .query<{ findOneLocation: LocationSchema }>({
        query: FIND_ONE_LOCATION_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findOneLocation));
  }

  createLocation(data: CreateLocationInput): Observable<LocationSchema> {
    return this.apollo
      .use('businessAPI')
      .mutate<{ createLocation: LocationSchema }>({
        mutation: CREATE_LOCATION_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.createLocation));
  }

  updateLocation(data: UpdateLocationInput): Observable<LocationSchema> {
    return this.apollo
      .use('businessAPI')
      .mutate<{ updateLocation: LocationSchema }>({
        mutation: UPDATE_LOCATION_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.updateLocation));
  }

  removeLocation(id: number): Observable<boolean> {
    return this.apollo
      .use('businessAPI')
      .mutate<{ removeLocation: boolean }>({
        mutation: REMOVE_LOCATION_MUTATION,
        variables: { id },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.removeLocation));
  }
}
