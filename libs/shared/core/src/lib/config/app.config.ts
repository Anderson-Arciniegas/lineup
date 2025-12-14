import { LanguageEnum } from '../enums';

export const appRoutes: AppRoutes = {
  home: '/',
  controlPanel: 'control-panel',
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
}
