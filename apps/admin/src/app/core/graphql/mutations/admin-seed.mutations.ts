import { gql } from 'apollo-angular';

export const ADMIN_SEED_DEVELOPMENT_BUSINESSES_MUTATION = gql`
  mutation AdminSeedDevelopmentBusinesses {
    seedDevelopmentBusinesses
  }
`;

export const ADMIN_SEED_DEVELOPMENT_CATALOGS_MUTATION = gql`
  mutation AdminSeedDevelopmentCatalogs {
    seedDevelopmentCatalogs
  }
`;

export const ADMIN_SEED_DEVELOPMENT_PRODUCTS_MUTATION = gql`
  mutation AdminSeedDevelopmentProducts {
    seedDevelopmentProducts
  }
`;
