import { gql } from 'apollo-angular';
import { adminUserFullSelection } from '../selections/admin-user.selection';

export const ADMIN_CREATE_USER_MUTATION = gql`
  mutation AdminCreateUser($data: CreateUserInput!) {
    createUser(data: $data) ${adminUserFullSelection}
  }
`;

export const ADMIN_UPDATE_USER_MUTATION = gql`
  mutation AdminUpdateUser($data: UpdateUserInput!) {
    updateUser(data: $data) ${adminUserFullSelection}
  }
`;

export const ADMIN_REMOVE_USER_MUTATION = gql`
  mutation AdminRemoveUser($id: Int!) {
    removeUser(id: $id)
  }
`;
