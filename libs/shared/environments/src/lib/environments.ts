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
}

export const environments: EnvironmentsConfig = {
  production: false,
  apiBusiness: '/business/',
  apiAdmin: '/admin/',
  apiUser: '/user/',
};

export const PROD: EnvironmentsConfig = {
  production: true,
  // In production you may want to point directly to the full URLs or use env replacement
  apiBusiness: 'http://localhost:3002/graphql', //'https://190.9.40.168/api3/graphql'
  apiAdmin: 'http://localhost:3001/graphql', //'https://190.9.40.168/api2/graphql'
  apiUser: 'http://localhost:3000/graphql', // //'https://190.9.40.168/api1/graphql'
};

// Default export for convenience
export default environments;
