/**
 * Shared environments for all apps.
 * Centralize API endpoints and environment flags here so every app can import
 * from `@lineup/envs`.
 */

/** Netlify define `URL` en el build; puedes forzar con `PUBLIC_SITE_URL` en el panel. */
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
  /**
   * `fetch` del PDF usa este prefijo en el mismo origen; en dev `proxy.conf.json` lo reenvía a S3.
   * En Netlify (u otro host) añade una regla de proxy equivalente antes del fallback SPA
   * (p. ej. en `public/_redirects`), o el catch-all servirá `index.html` y las imágenes del PDF fallarán.
   */
  catalogPdfMediaProxy?: {
    s3OriginPrefix: string;
    localPathPrefix: string;
  };
  /**
   * URL pública del front (sin barra final), p. ej. `https://tu-app.netlify.app`.
   * Usada en SSR para meta Open Graph absolutas (`og:url`, `og:image`).
   */
  publicSiteUrl: string;
  /**
   * Origen del servicio de sockets (Socket.IO), sin path de namespace.
   * Namespace del cliente: `/notifications-socket` (ver `NOTIFICATION_SOCKET_NAMESPACE` en core).
   */
  notificationsSocketUrl: string;
}

export const environment: EnvironmentConfig = {
  production: false,
  businessApi: 'https://businesses.api.lineup.com.ve/graphql',
  adminApi: 'https://admin.api.lineup.com.ve/graphql',
  userApi: 'https://users.api.lineup.com.ve/graphql',
  userApiFile: 'https://users.api.lineup.com.ve/',
  businessApiFile: 'https://businesses.api.lineup.com.ve/',
  adminApiFile: 'https://admin.api.lineup.com.ve/',
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
  publicSiteUrl: resolvePublicSiteUrl('http://localhost:4200'),
  notificationsSocketUrl: 'https://websockets.api.lineup.com.ve',
};

export const PROD: EnvironmentConfig = {
  production: true,
  // In production you may want to point directly to the full URLs or use env replacement
  businessApi: 'https://businesses.api.lineup.com.ve/graphql',
  adminApi: 'https://admin.api.lineup.com.ve/graphql',
  userApi: 'https://users.api.lineup.com.ve/graphql',
  userApiFile: 'https://users.api.lineup.com.ve/',
  businessApiFile: 'https://businesses.api.lineup.com.ve/',
  adminApiFile: 'https://admin.api.lineup.com.ve/',
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
  publicSiteUrl: resolvePublicSiteUrl('https://lineup-dev.netlify.app'),
  notificationsSocketUrl: 'https://websockets.api.lineup.com.ve',
};

// Default export for convenience
export default environment;
