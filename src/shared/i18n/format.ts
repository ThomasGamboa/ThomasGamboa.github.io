import { type Locale, localeDefinitions } from './locales.ts';

export interface Price {
  readonly amount: number;
  readonly currency: 'USD';
}

export function formatPrice(price: Price, locale: Locale): string {
  const amount = new Intl.NumberFormat(localeDefinitions[locale].intlLocale, {
    maximumFractionDigits: 0,
    useGrouping: 'always',
  }).format(price.amount);
  return `${amount} ${price.currency}`;
}

export function formatStorePrice(price: Price, locale: Locale): string {
  const amount = new Intl.NumberFormat(localeDefinitions[locale].intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price.amount);
  return `${amount} ${price.currency}`;
}

export function formatIndex(index: number): string {
  return String(index).padStart(2, '0');
}

export function formatMonth(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeDefinitions[locale].intlLocale, {
    year: 'numeric',
    month: isoDate.length > 4 ? 'long' : undefined,
    timeZone: 'UTC',
  }).format(new Date(isoDate));
}
