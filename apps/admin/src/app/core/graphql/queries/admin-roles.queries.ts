import { gql } from 'apollo-angular';
import { adminRoleSelection } from '../selections/admin-role.selection';

export const ADMIN_GET_ALL_ROLES_QUERY = gql`
  query AdminGetAllRoles {
    getAllRoles ${adminRoleSelection}
  }
`;

export const ADMIN_GET_ROLES_BY_BUSINESS_QUERY = gql`
  query AdminGetRolesByBusiness($idBusiness: Int!) {
    getRolesByBusiness(idBusiness: $idBusiness) ${adminRoleSelection}
  }
`;

export const ADMIN_GET_ROLES_BY_USER_QUERY = gql`
  query AdminGetRolesByUser($idUser: Int!) {
    getRolesByUser(idUser: $idUser) ${adminRoleSelection}
  }
`;
