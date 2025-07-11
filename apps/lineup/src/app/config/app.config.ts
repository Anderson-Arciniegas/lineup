import { LanguageEnum } from '@lineup/core';

export const appRoutes: AppRoutes = {
    home: '/',
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
}
