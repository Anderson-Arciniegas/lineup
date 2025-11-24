import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateUserInput, CreateUserResponse } from '../models';
import { UserSchema } from '../schemas';

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($data: CreateUserInput!) {
    createUser(data: $data) {
      id
      email
      firstName
      lastName
      username
      provider
      status
      emailValidated
      creationDate
      creationIp
    }
  }
`;

const GET_USER_QUERY = gql`
  query GetUser($id: Int!) {
    user(id: $id) {
      id
      email
      emailValidated
      firstName
      lastName
      username
      provider
      status
      creationDate
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UserGraphqlService {
  private apollo = inject(Apollo);

  createUser(data: CreateUserInput): Observable<any> {
    return this.apollo
      .use('userAPI')
      .mutate<CreateUserResponse>({
        mutation: CREATE_USER_MUTATION,
        variables: { data },
      })
      .pipe(map((result) => result.data!.createUser));
  }

  getUser(id: number): Observable<any> {
    return this.apollo
      .use('userAPI')
      .watchQuery<{ user: UserSchema }>({
        query: GET_USER_QUERY,
        variables: { id },
      })
      .valueChanges.pipe(map((result) => result.data.user));
  }

  // Si usas una API secundaria, especifica el cliente:
  // this.apollo.use('secondaryAPI').mutate(...)
}
