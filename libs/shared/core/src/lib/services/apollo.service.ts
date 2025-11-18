import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class ApolloService {
  private apollo = inject(Apollo);
  private httpLink = inject(HttpLink);

  initializeApollo(uri: string) {
    this.apollo.create({
      link: this.httpLink.create({ uri }),
      cache: new InMemoryCache(),
    });
  }
}
