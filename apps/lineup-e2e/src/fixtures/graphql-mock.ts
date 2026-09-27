import { Page, Route } from '@playwright/test';

export type SessionKind = 'none' | 'user' | 'business';
export type LoginOutcome = 'invalid' | 'user' | 'business';

export type GraphqlRequestBody = {
  operationName?: string;
  query?: string;
  variables?: Record<string, unknown>;
};

export type GraphqlMockState = {
  loginOutcome: LoginOutcome;
  session: SessionKind;
};

type GraphqlHandler = (
  body: GraphqlRequestBody,
  url: string,
) => Record<string, unknown> | { errors: Array<{ message: string }> } | null;

const fileImage = {
  name: 'cover.webp',
  url: '/assets/images/lineup.png',
  extension: 'webp',
  directory: 'images',
  creationDate: '2026-01-01T00:00:00.000Z',
  creationUser: { id: 1, username: 'demo', email: 'biz@demo.test' },
  thumbnails: {
    md: { height: 200, url: '/assets/images/lineup.png', width: 200 },
    sm: { height: 100, url: '/assets/images/lineup.png', width: 100 },
    xs: { height: 50, url: '/assets/images/lineup.png', width: 50 },
  },
};

const catalog = {
  id: 10,
  idCreationBusiness: 1,
  path: 'demo-catalog',
  title: 'Demo Catalog',
  hexColor: '#ffffff',
  imageCode: 'cover.webp',
  status: 'ACTIVE',
  tags: [] as string[],
  productsCount: 2,
  visits: 0,
  discounts: [] as unknown[],
  products: [] as unknown[],
  image: fileImage,
};

const business = {
  id: 1,
  email: 'biz@demo.test',
  path: 'demo-business',
  name: 'Demo Business',
  hexColor: '#336699',
  telephone: '+584121234567',
  description: 'Demo',
  isOnline: true,
  isBsEquivalentPriceEnabled: true,
  status: 'ACTIVE',
  imageCode: 'cover.webp',
  image: fileImage,
  tags: [] as string[],
};

Object.assign(catalog, { business });

const demoProduct = {
  id: 100,
  title: 'Demo Product',
  subtitle: 'Demo',
  description: 'Product description',
  isPrimary: true,
  catalog,
  business,
  idCatalog: 10,
  skus: [
    {
      id: 1,
      skuCode: 'SKU-1',
      price: 10,
      quantity: 5,
      idCurrency: 1,
      currency: { id: 1, code: 'USD', name: 'Dólar' },
    },
  ],
  productFiles: [] as unknown[],
  variations: [] as unknown[],
};

const shoesProduct = {
  ...demoProduct,
  id: 101,
  title: 'Zapatos Demo',
};

const userSession = {
  id: 1,
  email: 'user@demo.test',
  firstName: 'Demo',
  lastName: 'User',
  username: 'demo.user',
  status: 'ACTIVE',
};

const businessSession = {
  id: business.id,
  email: business.email,
  name: business.name,
  path: business.path,
  status: business.status,
  hexColor: business.hexColor,
  telephone: business.telephone,
  description: business.description,
  isOnline: business.isOnline,
  isBsEquivalentPriceEnabled: business.isBsEquivalentPriceEnabled,
  image: business.image,
  tags: business.tags,
};

const graphqlError = (message: string, businessCode?: number) => ({
  errors: [
    {
      message,
      extensions: businessCode
        ? {
            code: 'UNAUTHENTICATED',
            response: { statusCode: 401, code: businessCode },
          }
        : { code: 'UNAUTHENTICATED' },
    },
  ],
  data: null,
});

function isGraphqlErrorEnvelope(
  payload: unknown,
): payload is { errors: unknown[] } {
  return (
    !!payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { errors?: unknown }).errors)
  );
}

function corsHeadersFor(route: Route): Record<string, string> {
  const headers = route.request().headers();
  const origin = headers['origin'] || 'http://127.0.0.1:4200';
  const requested =
    headers['access-control-request-headers'] ||
    'content-type, authorization, apollo-require-preflight, x-apollo-operation-name';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': requested,
    Vary: 'Origin',
  };
}

const defaultPublicData: Record<string, unknown> = {
  findBusinessByPath: business,
  findCatalogsByBusinessId: {
    items: [catalog],
    total: 1,
    page: 1,
    limit: 20,
  },
  getAllPrimaryProductsByBusiness: [demoProduct],
  findOneCatalogByPath: catalog,
  findOneProduct: demoProduct,
};

function isUserApi(url: string): boolean {
  return url.includes('users.api') || url.includes('/api/user');
}

function inferOperation(query: string): string {
  const match = query.match(/(?:query|mutation)\s+(\w+)/);
  return match?.[1] ?? '';
}

function catalogProducts(search?: string): typeof demoProduct[] {
  const all = [demoProduct, shoesProduct];
  const term = (search ?? '').trim().toLowerCase();
  if (!term) {
    return all;
  }
  return all.filter((item) => item.title.toLowerCase().includes(term));
}

function paginationSearch(
  variables: Record<string, unknown> | undefined,
): string | undefined {
  const pagination = variables?.['pagination'] as
    | { search?: string }
    | undefined;
  return pagination?.search;
}

function buildDefaultResponse(
  operationName: string,
  url: string,
  state: GraphqlMockState,
  variables?: Record<string, unknown>,
): Record<string, unknown> | { errors: Array<{ message: string }> } {
  switch (operationName) {
    case 'Login': {
      if (state.loginOutcome === 'invalid') {
        return graphqlError('Unauthorized', 100000);
      }
      if (isUserApi(url)) {
        if (state.loginOutcome === 'user') {
          state.session = 'user';
          return {
            login: {
              code: 200,
              status: true,
              message: 'ok',
              user: userSession,
              business: null,
            },
          };
        }
        return graphqlError('Unauthorized');
      }
      if (state.loginOutcome === 'business') {
        state.session = 'business';
        return {
          login: {
            code: 200,
            status: true,
            message: 'ok',
            business: businessSession,
            user: null,
          },
        };
      }
      return graphqlError('Unauthorized');
    }
    case 'Me':
    case 'GetMe':
    case 'getMe':
      if (state.session !== 'user') {
        return graphqlError('Unauthorized');
      }
      return { me: userSession, getMe: userSession };
    case 'MyBusiness':
    case 'myBusiness':
      if (state.session !== 'business') {
        return graphqlError('Unauthorized');
      }
      return { myBusiness: businessSession };
    case 'SendVerificationCode':
    case 'SendBusinessVerificationCode':
    case 'SendUserVerificationCode':
      return {
        sendVerificationCode: { code: 200, status: true, message: 'ok' },
        sendBusinessVerificationCode: {
          code: 200,
          status: true,
          message: 'ok',
        },
        sendUserVerificationCode: { code: 200, status: true, message: 'ok' },
      };
    case 'VerifyCode':
    case 'VerifyBusinessVerificationCode':
    case 'VerifyUserVerificationCode':
      return {
        verifyCode: { code: 200, status: true, message: 'ok' },
        verifyBusinessVerificationCode: {
          code: 200,
          status: true,
          message: 'ok',
        },
        verifyUserVerificationCode: { code: 200, status: true, message: 'ok' },
      };
    case 'CreateUser':
      state.session = 'user';
      return {
        createUser: { code: 200, status: true, user: userSession },
      };
    case 'CreateBusiness':
      state.session = 'business';
      return {
        createBusiness: {
          code: 200,
          status: true,
          business: businessSession,
        },
      };
    case 'CreateProduct':
      return { createProduct: { ...demoProduct, id: 102, title: 'Pizza Demo' } };
    case 'UpdateProduct':
      return { updateProduct: demoProduct };
    case 'RemoveProduct':
      return { removeProduct: true };
    case 'UpdateProductSkus':
      return { updateProductSkus: demoProduct.skus };
    case 'FindAllCurrencies':
      return {
        findAllCurrencies: [
          { id: 1, code: 'USD', name: 'Dólar', status: 'ACTIVE' },
          { id: 2, code: 'BS', name: 'Bolívar', status: 'ACTIVE' },
          { id: 3, code: 'EUR', name: 'Euro', status: 'ACTIVE' },
        ],
      };
    case 'FindAllMyCatalogs':
      return {
        findAllMyCatalogs: {
          items: [catalog],
          total: 1,
          page: 1,
          limit: 200,
        },
      };
    case 'CreateCatalog':
      return { createCatalog: catalog };
    case 'UpdateCatalog':
      return { updateCatalog: catalog };
    case 'UpdateBusiness':
      return { updateBusiness: { ...businessSession, name: 'Negocio Editado' } };
    case 'RefreshToken': {
      if (isUserApi(url)) {
        if (state.session !== 'user') {
          return graphqlError('Unauthorized');
        }
        return {
          refreshToken: {
            code: 200,
            status: true,
            user: userSession,
            business: null,
          },
        };
      }
      if (state.session !== 'business') {
        return graphqlError('Unauthorized');
      }
      return {
        refreshToken: {
          code: 200,
          status: true,
          business: businessSession,
          user: null,
        },
      };
    }
    case 'FindOneCatalog':
      return { findOneCatalog: catalog };
    case 'GetStockByProduct':
      return { getStockByProduct: demoProduct.skus };
    case 'HasLikedProduct':
      return { hasLikedProduct: false };
    case 'FindBcvOfficialRates':
      return {
        findBcvOfficialRates: {
          dollar: 36.5,
          euro: 40,
          sourceDate: '2026-09-20',
        },
      };
    case 'FindSocialNetworkBusinessesByBusiness':
      return {
        findByBusiness: [
          {
            id: 1,
            url: '',
            phone: '+584121234567',
            socialNetwork: { id: 1, code: 'WHATSAPP', name: 'WhatsApp' },
          },
        ],
      };
    case 'GetAllDraftProducts':
      return {
        getAllDraftProducts: {
          items: [{ id: 201, title: 'Draft Product', status: 'DRAFT' }],
          total: 1,
          page: 1,
          limit: 50,
        },
      };
    case 'GetAllByCatalogPaginated': {
      const items = catalogProducts(paginationSearch(variables));
      return {
        getAllByCatalogPaginated: {
          items,
          total: items.length,
          page: 1,
          limit: 100,
        },
      };
    }
    case 'GetAllByCatalog':
      return { getAllByCatalog: catalogProducts() };
    case 'FindBusinessByPath':
    case 'findBusinessByPath':
      return { findBusinessByPath: business };
    case 'FindCatalogsByBusinessId':
      return {
        findCatalogsByBusinessId: defaultPublicData.findCatalogsByBusinessId,
      };
    case 'GetAllPrimaryProductsByBusiness':
      return { getAllPrimaryProductsByBusiness: [demoProduct] };
    case 'FindOneCatalogByPath':
      return { findOneCatalogByPath: catalog };
    case 'FindOneProduct':
      return { findOneProduct: demoProduct };
    case 'BusinessEngagementStats':
      return {
        businessEngagementStats: {
          newFollowers: { total: 0 },
          visits: {
            visits: { total: 0 },
            visitsByAuthType: { anonymous: 0, identified: 0, data: [] },
          },
        },
      };
    case 'InventoryStats':
      return {
        inventoryStats: {
          productsWithoutStockCount: 0,
          skusLowOrOutOfStockCount: 0,
          recentStockMovements: [],
        },
      };
    case 'ProductStats':
      return {
        productStats: {
          topByLikes: [],
          topByRating: [],
          topByVisits: [],
          visitToLikeRatio: { ratio: 0, totalLikes: 0, totalVisits: 0 },
          withoutRatingsCount: 0,
          withoutVisitsCount: 0,
        },
      };
    case 'CatalogStats':
    case 'DiscountStats':
    case 'BusinessSalesInTimePeriod':
      return {
        catalogStats: {
          catalogVisitsOverTime: { total: 0 },
          topByVisits: [],
          productsPerCatalog: [],
        },
        discountStats: { byStatus: [], byType: [], expiringSoon: { total: 0 } },
        businessSalesInTimePeriod: { sales: [], salesCount: { total: 0 } },
      };
    case 'FindAllMyBusinessHours':
      return { findAllMyBusinessHours: [] };
    case 'FindAllMyLocations':
      return { findAllMyLocations: [] };
    case 'FindAllSocialMedias':
    case 'FindAllMySocialNetworkBusinesses':
      return {
        findAllSocialMedias: [],
        findAllMySocialNetworkBusinesses: [],
      };
    case 'FindAllMyDiscounts':
      return { findAllMyDiscounts: { items: [], total: 0, page: 1, limit: 20 } };
    case 'GetFavoritesProducts':
      return { getFavoritesProducts: [] };
    case 'GetWishlistProducts':
      return { getWishlistProducts: [] };
    case 'MyRatings':
      return { myRatings: [] };
    case 'UnreadUserNotificationsCount':
      return { unreadUserNotificationsCount: 0 };
    case 'LogOut':
    case 'logOut':
    case 'Logout':
      return { logOut: true, logout: { status: true } };
    case 'RecordVisit':
      return { recordVisit: true };
    default:
      return {};
  }
}

export type GraphqlMockController = {
  state: GraphqlMockState;
  setLoginOutcome: (outcome: LoginOutcome) => void;
  setSession: (session: SessionKind) => void;
};

/**
 * Intercepta GraphQL (APIs remotas y proxy local) y uploads REST de archivos.
 */
export async function setupGraphqlMocks(
  page: Page,
  options?: Partial<GraphqlMockState> & { handler?: GraphqlHandler },
): Promise<GraphqlMockController> {
  const state: GraphqlMockState = {
    loginOutcome: options?.loginOutcome ?? 'invalid',
    session: options?.session ?? 'none',
  };

  const fulfillGraphql = async (route: Route) => {
    const cors = corsHeadersFor(route);
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }

    let body: GraphqlRequestBody = {};
    try {
      body = (request.postDataJSON() as GraphqlRequestBody) ?? {};
    } catch {
      body = {};
    }

    const url = request.url();
    const op = body.operationName ?? inferOperation(body.query ?? '');
    const custom = options?.handler?.(body, url);
    const payload =
      custom ?? buildDefaultResponse(op, url, state, body.variables);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      body: JSON.stringify(
        isGraphqlErrorEnvelope(payload) ? payload : { data: payload },
      ),
    });
  };

  const fulfillUpload = async (route: Route) => {
    const cors = corsHeadersFor(route);
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      body: JSON.stringify({
        file: {
          name: 'cover.webp',
          url: '/assets/images/lineup.png',
        },
        status: true,
        code: 200,
      }),
    });
  };

  const fulfillImport = async (route: Route) => {
    const cors = corsHeadersFor(route);
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      body: JSON.stringify({
        status: true,
        code: 710100,
        message: 'queued',
      }),
    });
  };

  await page.route('**/graphql', fulfillGraphql);
  await page.route('**/api/user', fulfillGraphql);
  await page.route('**/api/business', fulfillGraphql);
  await page.route('**/files/upload', fulfillUpload);
  await page.route('**/files/upload-document', fulfillImport);

  return {
    state,
    setLoginOutcome: (outcome) => {
      state.loginOutcome = outcome;
    },
    setSession: (session) => {
      state.session = session;
    },
  };
}

export { userSession, businessSession, defaultPublicData, demoProduct, catalog };
