/**
 * Plantilla: copia este archivo a `environments.ts` (misma carpeta) y rellena los valores.
 * `environments.ts` está en .gitignore y no se versiona.
 */

function resolvePublicSiteUrl(fallback: string): string {
  const proc = (
    globalThis as unknown as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process;
  const raw =
    proc?.env?.['PUBLIC_SITE_URL'] ??
    proc?.env?.['URL'] ??
    proc?.env?.['DEPLOY_PRIME_URL'];
  const t = raw?.replace(/\/$/, '').trim();
  return t || fallback;
}

export interface EnvironmentConfig {
  production: boolean;
  businessApi: string;
  adminApi: string;
  userApi: string;
  userApiFile: string;
  businessApiFile: string;
  adminApiFile: string;
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
  catalogPdfMediaProxy?: {
    s3OriginPrefix: string;
    localPathPrefix: string;
  };
  publicSiteUrl: string;
  notificationsSocketUrl: string;
}

export const environment: EnvironmentConfig = {
  production: false,
  businessApi: 'https://your-business-api.example/graphql',
  adminApi: 'https://your-admin-api.example/graphql',
  userApi: 'https://your-user-api.example/graphql',
  userApiFile: 'https://your-user-api.example/',
  businessApiFile: 'https://your-business-api.example/',
  adminApiFile: 'https://your-admin-api.example/',
  google: {
    GOOGLE_ID: 'YOUR_GOOGLE_OAUTH_CLIENT_ID',
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_KEY',
    GOOGLE_MAPS_API_URL: 'https://maps.googleapis.com/maps/api/js?key=',
    GEMINI_API_KEY: 'YOUR_GEMINI_KEY',
    GEMINI_MODEL: 'gemini-2.5-flash',
  },
  crypto: {
    seed: 'YOUR_DEV_SEED',
    secret: 'YOUR_64_CHAR_HEX_SECRET',
  },
  catalogPdfMediaProxy: {
    s3OriginPrefix: 'https://your-bucket.s3.region.amazonaws.com',
    localPathPrefix: '/s3-lineup-media',
  },
  publicSiteUrl: resolvePublicSiteUrl('http://localhost:4200'),
  notificationsSocketUrl: 'https://your-websocket-host.example',
};

export const PROD: EnvironmentConfig = {
  production: true,
  businessApi: 'https://your-business-api.example/graphql',
  adminApi: 'https://your-admin-api.example/graphql',
  userApi: 'https://your-user-api.example/graphql',
  userApiFile: 'https://your-user-api.example/',
  businessApiFile: 'https://your-business-api.example/',
  adminApiFile: 'https://your-admin-api.example/',
  google: {
    GOOGLE_ID: 'YOUR_GOOGLE_OAUTH_CLIENT_ID',
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_KEY',
    GOOGLE_MAPS_API_URL: 'https://maps.googleapis.com/maps/api/js?key=',
    GEMINI_API_KEY: 'YOUR_GEMINI_KEY',
    GEMINI_MODEL: 'gemini-2.5-flash',
  },
  crypto: {
    seed: 'YOUR_PROD_SEED',
    secret: 'YOUR_64_CHAR_HEX_SECRET',
  },
  catalogPdfMediaProxy: {
    s3OriginPrefix: 'https://your-bucket.s3.region.amazonaws.com',
    localPathPrefix: '/s3-lineup-media',
  },
  publicSiteUrl: resolvePublicSiteUrl('https://your-site.example'),
  notificationsSocketUrl: 'https://your-websocket-host.example',
};

export default environment;
