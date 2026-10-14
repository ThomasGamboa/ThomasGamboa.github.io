import type { Locale } from '../shared/i18n/locales.ts';
import type { SafeHtml } from './html.ts';
import type { Route } from './routes.ts';

export interface PageContext {
  readonly route: Route;
  readonly locale: Locale;
  readonly year: number;
}

export interface PageMeta {
  readonly title: string;
  readonly description: string;
  readonly openGraphType: 'website' | 'profile' | 'article';
  readonly structuredData: Readonly<Record<string, unknown>> | null;
}

export interface PageDocument {
  readonly meta: PageMeta;
  readonly main: SafeHtml;
  readonly overlay?: SafeHtml;
}
