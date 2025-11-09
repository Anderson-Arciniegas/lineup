import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraphqlService } from '../graphql.service';
import { CreateBusinessInput } from '../inputs';
import { BusinessSchema } from '@lineup/core';
import { businessSelection } from '../selections';

/**
 * Business-related GraphQL operations.
 *
 * Pattern:
 * - Keep GraphQL strings local to each method.
 * - Use a small wrapper service that delegates to GraphqlService.request
 *   so we keep a single place that handles withCredentials and HTTP details.
 */

@Injectable({ providedIn: 'root' })
export class BusinessesService {
  private fullSelection = businessSelection;
  constructor(private gql: GraphqlService) {}

  /**
   * Create a business using the GraphQL mutation on the /business endpoint.
   */
  createBusiness(data: CreateBusinessInput, selection?: string): Observable<BusinessSchema> {
    // If caller provides a selection string, use it. They can pass either:
    // - a brace-wrapped block: '{ id }' or '{ id name }'
    // - or a bare list: 'id' or 'id name'
    // Otherwise use the full default selection below.

    const selectionBlock = selection
      ? (selection.trim().startsWith('{') ? selection : `{ ${selection} }`)
      : this.fullSelection;
    const mutation = `mutation CreateBusiness($data: CreateBusinessInput!) {
      createBusiness(data: $data) ${selectionBlock}
    }`;

    return this.gql
      .request('business', mutation, { data })
      .pipe(
        map((res: unknown) => {
          // If the caller requested only a subset (e.g. '{ id }'), the runtime
          // response will only include those fields. We still cast to BusinessSchema
          // but callers should expect some fields may be undefined.
          const response = res as { data?: { createBusiness?: BusinessSchema } };
          if (response && response.data && response.data.createBusiness) {
            return response.data.createBusiness as BusinessSchema;
          }
          throw new Error('Unexpected response from createBusiness');
        })
      );
  }

  // Additional operations can follow the same pattern:
  // - getBusiness(id)
  // - listBusinesses(filter)
  // - updateBusiness(id, input)
  // - deleteBusiness(id)
  /**
   * Query a single business by id using the GraphQL query findOneBusiness(id: Int!).
   * Accepts an optional selection string (e.g. 'id' or '{ id name }') to request
   * only the fields needed.
   */
  findOneBusiness(id: number, selection?: string): Observable<BusinessSchema> {
    const fullSelection = this.fullSelection;
    const selectionBlock = selection
      ? (selection.trim().startsWith('{') ? selection : `{ ${selection} }`)
      : fullSelection;

    const query = `query findOneBusiness($id: Int!) {
      findOneBusiness(id: $id) ${selectionBlock}
    }`;

    return this.gql.request('business', query, { id }).pipe(
      map((res: unknown) => {
        const obj = (res as Record<string, unknown>) ?? null;
        // Case: { data: { findOneBusiness: {...} } }
        if (obj && typeof obj === 'object' && 'data' in obj) {
          const data = obj['data'] as Record<string, unknown> | undefined;
          if (data && 'findOneBusiness' in data) {
            return data['findOneBusiness'] as BusinessSchema;
          }
        }

        // Case: { findOneBusiness: {...} }
        if (obj && typeof obj === 'object' && 'findOneBusiness' in obj) {
          return obj['findOneBusiness'] as BusinessSchema;
        }

        // Case: response with body
        if (obj && typeof obj === 'object' && 'body' in obj) {
          const body = obj['body'] as Record<string, unknown> | undefined;
          if (body && 'data' in body) {
            const data = body['data'] as Record<string, unknown> | undefined;
            if (data && 'findOneBusiness' in data) {
              return data['findOneBusiness'] as BusinessSchema;
            }
          }
        }

        // GraphQL errors
        if (obj && typeof obj === 'object' && 'errors' in obj) {
          const errors = obj['errors'];
          const msg = Array.isArray(errors) ? JSON.stringify(errors) : String(errors);
          throw new Error(`GraphQL errors from findOneBusiness: ${msg}`);
        }

        const raw = res && typeof res === 'object' ? JSON.stringify(res) : String(res);
        throw new Error(`Unexpected response from findOneBusiness: ${raw}`);
      })
    );
  }
}
