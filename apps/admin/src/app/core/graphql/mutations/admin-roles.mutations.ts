import { gql } from 'apollo-angular';
import { adminRoleSelection } from '../selections/admin-role.selection';

export const ADMIN_ASSIGN_ROLE_TO_BUSINESS_MUTATION = gql`
  mutation AdminAssignRoleToBusiness($data: AssignRoleToBusinessInput!) {
    assignRoleToBusiness(data: $data) ${adminRoleSelection}
  }
`;

export const ADMIN_ASSIGN_ROLE_TO_USER_MUTATION = gql`
  mutation AdminAssignRoleToUser($data: AssignRoleToUserInput!) {
    assignRoleToUser(data: $data) ${adminRoleSelection}
  }
`;

export const ADMIN_REMOVE_ROLE_FROM_BUSINESS_MUTATION = gql`
  mutation AdminRemoveRoleFromBusiness($data: RemoveRoleFromBusinessInput!) {
    removeRoleFromBusiness(data: $data)
  }
`;

export const ADMIN_REMOVE_ROLE_FROM_USER_MUTATION = gql`
  mutation AdminRemoveRoleFromUser($data: RemoveRoleFromUserInput!) {
    removeRoleFromUser(data: $data)
  }
`;
