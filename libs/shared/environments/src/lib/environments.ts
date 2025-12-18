/**
 * Shared environments for all apps.
 * Centralize API endpoints and environment flags here so every app can import
 * from `@lineup/envs`.
 */

export interface EnvironmentsConfig {
  production: boolean;
  apiBusiness: string; // business -> /api3/graphql
  apiAdmin: string; // admin -> /api2/graphql
  apiUser: string; // user -> /api1/graphql
  userApiFile: string; // user -> /api1/file
  businessApiFile: string; // business -> /api3/file
}

export const environments: EnvironmentsConfig = {
  production: false,
  apiBusiness: '/api/business-graphql/',
  apiAdmin: '/api/admin-graphql/',
  apiUser: '/api/user-graphql/',
  userApiFile: '/api/user-file/',
  businessApiFile: '/api/business-file/',
};

export const PROD: EnvironmentsConfig = {
  production: true,
  // In production you may want to point directly to the full URLs or use env replacement
  apiBusiness: 'https://190.9.40.168/api3/graphql',
  apiAdmin: 'https://190.9.40.168/api2/graphql',
  apiUser: 'https://190.9.40.168/api1/graphql',
  userApiFile: 'https://190.9.40.168/api1/files',
  businessApiFile: 'https://190.9.40.168/api3/files',
};

// Default export for convenience
export default environments;
