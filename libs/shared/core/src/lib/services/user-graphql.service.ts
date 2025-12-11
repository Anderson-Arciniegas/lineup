import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateUserInput, CreateUserResponse } from '../models';
import { UserSchema } from '../schemas';

const LOGIN = gql`
  mutation Login($login: LoginDto!) {
    login(login: $login) {
      code
      status
      user {
        id
        email
        username
        firstName
        lastName
        userRoles {
          idRole
          idUser
          role {
            id
            code
            description
          }
        }
      }
    }
  }
`;

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($data: CreateUserInput!) {
    createUser(data: $data) {
      code
      status
      user {
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
  }
`;

const GET_USER_QUERY = gql`
  query GetUser($id: Int!) {
    userById(id: $id) {
      id
      email
      emailValidated
      firstName
      lastName
      username
      provider
      status
      creationDate
      userRoles {
        idRole
        idUser
        role {
          id
          code
          description
        }
      }
    }
  }
`;

const GET_ME = gql`
  query Me {
    me {
      id
      email
      emailValidated
      firstName
      lastName
      username
      provider
      status
      creationDate
      creationIp
      modificationDate
      modificationIp
      creationCoordinate {
        latitude
        longitude
      }
      modificationCoordinate {
        latitude
        longitude
      }
      userRoles {
        idRole
        idUser
        idCreationUser
        status
        creationDate
        creationIp
        modificationDate
        modificationIp
        creationCoordinate {
          latitude
          longitude
        }
        modificationCoordinate {
          latitude
          longitude
        }
        role {
          id
          code
          description
          status
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UserGraphqlService {
  private apollo = inject(Apollo);

  login(email: string, password: string): Observable<any> {
    return this.apollo
      .use('userAPI')
      .mutate<any>({
        mutation: LOGIN,
        variables: { login: { email, password } },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.login.user));
  }

  getMe(): Observable<any> {
    return this.apollo
      .use('userAPI')
      .query<{ me: UserSchema }>({
        query: GET_ME,
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.me));
  }

  createUser(data: CreateUserInput): Observable<any> {
    return this.apollo
      .use('userAPI')
      .mutate<CreateUserResponse>({
        mutation: CREATE_USER_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.createUser.user));
  }

  getUser(id: number): Observable<any> {
    return this.apollo
      .use('userAPI')
      .query<{ user: UserSchema }>({
        query: GET_USER_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.user));
  }

  // Si usas una API secundaria, especifica el cliente:
  // this.apollo.use('secondaryAPI').mutate(...)
}
