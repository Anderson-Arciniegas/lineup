import { gql } from 'apollo-angular';
import { businessFullSelection } from '@libs/graphql';

export const ADMIN_FIND_ALL_BUSINESSES_QUERY = gql`
  query AdminFindAllBusinesses($pagination: InfinityScrollInput!) {
    findAllBusinesses(pagination: $pagination) {
      items ${businessFullSelection}
      limit
      page
      total
    }
  }
`;

export const ADMIN_FIND_ONE_BUSINESS_QUERY = gql`
  query AdminFindOneBusiness($id: Int!) {
    findOneBusiness(id: $id) ${businessFullSelection}
  }
`;
