export const locales = ['es', 'en'] as const;

export type Locale = (typeof locales)[number];

export type Localized<T> = Readonly<Record<Locale, T>>;

export type LocalizedText = Localized<string>;

export interface LocaleDefinition {
  readonly code: Locale;
  readonly htmlLang: string;
  readonly hreflang: string;
  readonly openGraphLocale: string;
  readonly intlLocale: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly pathPrefix: string;
}

export const defaultLocale: Locale = 'es';

export const xDefaultLocale: Locale = 'en';

export const localeDefinitions: Localized<LocaleDefinition> = {
  es: {
    code: 'es',
    htmlLang: 'es',
    hreflang: 'es',
    openGraphLocale: 'es_LA',
    intlLocale: 'es-EC',
    label: 'Español',
    shortLabel: 'ES',
    pathPrefix: '',
  },
  en: {
    code: 'en',
    htmlLang: 'en',
    hreflang: 'en',
    openGraphLocale: 'en_US',
    intlLocale: 'en-US',
    label: 'English',
    shortLabel: 'EN',
    pathPrefix: '/en',
  },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
