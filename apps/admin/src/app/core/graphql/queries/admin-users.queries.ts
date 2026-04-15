import { gql } from 'apollo-angular';
import { adminUserFullSelection } from '../selections/admin-user.selection';

export const ADMIN_FIND_ALL_USERS_QUERY = gql`
  query AdminFindAllUsers($pagination: InfinityScrollInput!) {
    findAllUsers(pagination: $pagination) {
      items ${adminUserFullSelection}
      limit
      page
      total
    }
  }
`;

export const ADMIN_FIND_ONE_USER_QUERY = gql`
  query AdminFindOneUser($id: Int!) {
    findOneUser(id: $id) ${adminUserFullSelection}
  }
`;
