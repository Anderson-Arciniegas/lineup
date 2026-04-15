import { gql } from 'apollo-angular';
import { adminUserFullSelection } from '../selections/admin-user.selection';

export const ADMIN_ME_QUERY = gql`
  query AdminMe {
    me ${adminUserFullSelection}
  }
`;
