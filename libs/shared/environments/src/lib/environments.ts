/**
 * Shared environments for all apps.
 * Centralize API endpoints and environment flags here so every app can import
 * from `@lineup/envs`.
 */

export interface EnvironmentConfig {
  production: boolean;
  businessApi: string;
  adminApi: string;
  userApi: string;
  userApiFile: string;
  businessApiFile: string;
  google: {
    GOOGLE_ID: string;
    GOOGLE_MAPS_API_KEY: string;
    GOOGLE_MAPS_API_URL: string;
    GEMINI_API_KEY: string;
    GEMINI_MODEL: string;
  };
  crypto: {
    seed: string;
    secret: string;
  };
  /**
   * Solo desarrollo: `fetch` del PDF va al prefijo local; `proxy.conf.json` lo reenvía al bucket S3
   * (evita CORS en localhost). En producción configura CORS en el bucket o un proxy en tu API.
   */
  catalogPdfMediaProxy?: {
    s3OriginPrefix: string;
    localPathPrefix: string;
  };
}

export const environment: EnvironmentConfig = {
  production: false,
  businessApi: 'https://businesses.api.lineup.com.ve/graphql',
  adminApi: 'https://admin.api.lineup.com.ve/graphql',
  userApi: 'https://users.api.lineup.com.ve/graphql',
  userApiFile: 'https://users.api.lineup.com.ve/',
  businessApiFile: 'https://businesses.api.lineup.com.ve/',
  google: {
    GOOGLE_ID:
      '193526416514-fnmifm4h0k4rfqrgb1f436okag52ef9s.apps.googleusercontent.com',
    GOOGLE_MAPS_API_KEY: 'AIzaSyB-wWujcOp0U_dDay-ZMEOSuKoJEZii0II',
    GOOGLE_MAPS_API_URL: 'https://maps.googleapis.com/maps/api/js?key=',
    GEMINI_API_KEY: 'AIzaSyDSar4Pi6I9vpIZoj15-dCBXvG1vQOrnXA',
    GEMINI_MODEL: 'gemini-2.5-flash',
  },
  crypto: {
    seed: 'ThisIsTheDevSeed',
    secret: 'a7f82e39372e2f31b878c3971cac81d04bcff42ad9538131418d6d5e1047f04d',
  },
  catalogPdfMediaProxy: {
    s3OriginPrefix: 'https://test-mangloo.s3.us-east-1.amazonaws.com',
    localPathPrefix: '/s3-lineup-media',
  },
};

export const PROD: EnvironmentConfig = {
  production: true,
  // In production you may want to point directly to the full URLs or use env replacement
  businessApi: 'https://businesses.api.lineup.com.ve/graphql',
  adminApi: 'https://admin.api.lineup.com.ve/graphql',
  userApi: 'https://users.api.lineup.com.ve/graphql',
  userApiFile: 'https://users.api.lineup.com.ve/',
  businessApiFile: 'https://businesses.api.lineup.com.ve/',
  google: {
    GOOGLE_ID:
      '193526416514-fnmifm4h0k4rfqrgb1f436okag52ef9s.apps.googleusercontent.com',
    GOOGLE_MAPS_API_KEY: 'AIzaSyB-wWujcOp0U_dDay-ZMEOSuKoJEZii0II',
    GOOGLE_MAPS_API_URL: 'https://maps.googleapis.com/maps/api/js?key=',
    GEMINI_API_KEY: 'AIzaSyDSar4Pi6I9vpIZoj15-dCBXvG1vQOrnXA',
    GEMINI_MODEL: 'gemini-2.5-flash',
  },
  crypto: {
    seed: 'ThisIsTheDevSeed',
    secret: 'a7f82e39372e2f31b878c3971cac81d04bcff42ad9538131418d6d5e1047f04d',
  },
};

// Default export for convenience
export default environment;
