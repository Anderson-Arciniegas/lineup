import { NgModule } from '@angular/core';

/**
 * Lightweight GraphqlModule
 *
 * We removed `apollo-angular` because it has a peer dependency incompatible with
 * Angular 20. The project uses `@apollo/client` and a small `GraphqlService`
 * (HTTP-based) to make requests with cookies. Keep this module as a place to
 * import shared GraphQL services in the future.
 */
@NgModule({})
export class GraphqlModule {}
