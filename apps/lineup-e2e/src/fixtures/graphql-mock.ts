import { Page, Route } from '@playwright/test';

type GraphqlHandler = (body: {
  operationName?: string;
  query?: string;
}) => Record<string, unknown> | null;

const defaultPublicData: Record<string, unknown> = {
  findBusinessByPath: {
    id: 1,
    path: 'demo-business',
    name: 'Demo Business',
    hexColor: '#336699',
    description: 'Demo',
  },
  findCatalogsByBusinessId: {
    items: [{ id: 10, path: 'demo-catalog', title: 'Demo Catalog', hexColor: '#fff' }],
    total: 1,
    page: 1,
    limit: 20,
  },
  getAllPrimaryProductsByBusiness: [],
  findOneCatalogByPath: {
    id: 10,
    path: 'demo-catalog',
    title: 'Demo Catalog',
    hexColor: '#ffffff',
    tags: [],
    image: { url: '/assets/images/lineup.png', name: 'cover' },
  },
  findOneProduct: {
    id: 100,
    title: 'Demo Product',
    description: 'Product description',
    skus: [{ id: 1, skuCode: 'SKU-1', price: 10, quantity: 5, currency: { code: 'USD' } }],
  },
};

const userSession = {
  id: 1,
  email: 'user@demo.test',
  firstName: 'Demo',
  lastName: 'User',
};

const businessSession = {
  id: 1,
  path: 'demo-business',
  name: 'Demo Business',
  hexColor: '#336699',
};

/**
 * Intercepta peticiones GraphQL del proxy local (`/api/user`, `/api/business`) y devuelve JSON mínimo.
 */
export async function setupGraphqlMocks(
  page: Page,
  handler?: GraphqlHandler,
): Promise<void> {
  const fulfill = async (route: Route) => {
    const request = route.request();
    let body: { operationName?: string; query?: string } = {};
    try {
      body = request.postDataJSON() ?? {};
    } catch {
      body = {};
    }

    const op = body.operationName ?? inferOperation(body.query ?? '');
    const custom = handler?.(body);
    const data = custom ?? buildDefaultResponse(op);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data }),
    });
  };

  await page.route('**/api/user', fulfill);
  await page.route('**/api/business', fulfill);
  await page.route('**/graphql', fulfill);
}

function inferOperation(query: string): string {
  const match = query.match(/(?:query|mutation)\s+(\w+)/);
  return match?.[1] ?? '';
}

function buildDefaultResponse(operationName: string): Record<string, unknown> {
  switch (operationName) {
    case 'GetMe':
    case 'getMe':
      return { getMe: userSession };
    case 'MyBusiness':
    case 'myBusiness':
      return { myBusiness: businessSession };
    case 'FindBusinessByPath':
    case 'findBusinessByPath':
      return { findBusinessByPath: defaultPublicData.findBusinessByPath };
    case 'FindCatalogsByBusinessId':
      return { findCatalogsByBusinessId: defaultPublicData.findCatalogsByBusinessId };
    case 'GetAllPrimaryProductsByBusiness':
      return { getAllPrimaryProductsByBusiness: [] };
    case 'FindOneCatalogByPath':
      return { findOneCatalogByPath: defaultPublicData.findOneCatalogByPath };
    case 'FindOneProduct':
      return { findOneProduct: defaultPublicData.findOneProduct };
    case 'FindAllMyCatalogs':
      return {
        findAllMyCatalogs: {
          items: [{ id: 10, path: 'demo-catalog', title: 'Demo Catalog' }],
          total: 1,
          page: 1,
          limit: 200,
        },
      };
    case 'BusinessEngagementStats':
      return {
        businessEngagementStats: {
          newFollowers: { total: 0 },
          visits: { visits: { total: 0 }, visitsByAuthType: { anonymous: 0, identified: 0, data: [] } },
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
        catalogStats: { catalogVisitsOverTime: { total: 0 }, topByVisits: [], productsPerCatalog: [] },
        discountStats: { byStatus: [], byType: [], expiringSoon: { total: 0 } },
        businessSalesInTimePeriod: { sales: [], salesCount: { total: 0 } },
      };
    case 'FindAllMyBusinessHours':
      return { findAllMyBusinessHours: [] };
    case 'FindAllMyLocations':
      return { findAllMyLocations: [] };
    case 'FindAllSocialMedias':
      return { findAllSocialMedias: [] };
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
      return { logOut: true };
    default:
      return {};
  }
}

export { userSession, businessSession, defaultPublicData };
