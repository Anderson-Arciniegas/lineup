import { LanguageEnum } from '../enums';

export const appRoutes: AppRoutes = {
  home: '/',
  controlPanel: 'control-panel',
  setup: 'setup',
  create: 'create',
  info: 'info',
  login: 'login',
  register: 'register',
  user: 'user',
  business: 'business',
  search: 'search',
  createProduct: 'create-product',
  edit: 'edit',
  profile: 'profile',
  dashboard: 'dashboard',
  createCatalog: 'create-catalog',
  lineup: 'lineup',
  catalogs: 'catalogs',
  inventory: 'inventory',
  registerSale: 'register-sale',
  settings: 'settings',
  socialMedias: 'social-medias',
  locations: 'locations',
  followers: 'followers',
  discounts: 'discounts',
  statistics: 'statistics',
  tag: 'tag',
  businessHours: 'business-hours',
  download: 'download',
  favorites: 'favorites',
  wishlist: 'wishlist',
  myRatings: 'my-ratings',
  termsAndConditions: 'terminos-y-condiciones',
  privacyPolicy: 'politica-de-privacidad',
};

export const languagesList: Language[] = [
  {
    language: 'Español',
    flag: 'assets/images/flags/spanish.svg',
    symbol: LanguageEnum.ES,
  },
  {
    language: 'English',
    flag: 'assets/images/flags/english.svg',
    symbol: LanguageEnum.EN,
  },
];

export interface Config {
  routes?: AppRoutes;
  languages: Language[];
}

export interface Language {
  language: string;
  flag: string;
  symbol: string;
}

export interface AppRoutes {
  home: string;
  controlPanel: string;
  setup: string;
  create: string;
  info: string;
  login: string;
  register: string;
  user: string;
  business: string;
  search: string;
  createProduct: string;
  edit: string;
  profile: string;
  dashboard: string;
  createCatalog: string;
  lineup: string;
  catalogs: string;
  inventory: string;
  registerSale: string;
  settings: string;
  socialMedias: string;
  locations: string;
  followers: string;
  discounts: string;
  statistics: string;
  tag: string;
  businessHours: string;
  download: string;
  favorites: string;
  wishlist: string;
  myRatings: string;
  termsAndConditions: string;
  privacyPolicy: string;
}
