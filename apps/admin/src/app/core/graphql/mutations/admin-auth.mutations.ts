import { gql } from 'apollo-angular';
import { adminBaseResponseSelection } from '../selections/admin-common.selection';
import { adminLoginResponseSelection } from '../selections/admin-user.selection';

export const ADMIN_LOGIN_MUTATION = gql`
  mutation AdminLogin($login: LoginDto!) {
    login(login: $login) ${adminLoginResponseSelection}
  }
`;

export const ADMIN_LOGOUT_MUTATION = gql`
  mutation AdminLogout {
    logout ${adminBaseResponseSelection}
  }
`;
