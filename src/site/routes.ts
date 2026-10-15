import type { WorldId } from '../content/types.ts';
import { worlds } from '../content/worlds.ts';
import { defaultLocale, type Locale, locales } from '../shared/i18n/locales.ts';
import { hirePath, homePath, projectPath } from '../shared/i18n/paths.ts';

export type ClientEntry = 'home' | 'hire' | 'site';

export const clientEntries: Readonly<Record<ClientEntry, string>> = {
  home: '/src/client/entries/home.ts',
  hire: '/src/client/entries/hire.ts',
  site: '/src/client/entries/site.ts',
};

export type RouteView =
  | { readonly kind: 'home' }
  | { readonly kind: 'hire' }
  | { readonly kind: 'world'; readonly worldId: WorldId }
  | { readonly kind: 'not-found' };

export interface Route {
  readonly id: string;
  readonly locale: Locale;
  readonly view: RouteView;
  readonly path: string;
  readonly outputFile: string;
  readonly alternates: Readonly<Partial<Record<Locale, string>>>;
  readonly indexable: boolean;
  readonly entry: ClientEntry;
}

export function outputFileFor(path: string): string {
  return path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);
}

function localizedRoutes(
  id: string,
  view: RouteView,
  entry: ClientEntry,
  pathFor: (locale: Locale) => string,
): Route[] {
  const alternates = Object.fromEntries(
    locales.map((locale) => [locale, pathFor(locale)]),
  ) as Record<Locale, string>;

  return locales.map((locale) => ({
    id: `${id}.${locale}`,
    locale,
    view,
    path: alternates[locale],
    outputFile: outputFileFor(alternates[locale]),
    alternates,
    indexable: true,
    entry,
  }));
}

export function buildRoutes(): readonly Route[] {
  const worldRoutes = worlds
    .filter((world) => world.page !== null)
    .flatMap((world) =>
      localizedRoutes(`world.${world.id}`, { kind: 'world', worldId: world.id }, 'site', (locale) =>
        projectPath(locale, world.slug),
      ),
    );

  return [
    ...localizedRoutes('home', { kind: 'home' }, 'home', homePath),
    ...localizedRoutes('hire', { kind: 'hire' }, 'hire', hirePath),
    ...worldRoutes,
    {
      id: 'not-found',
      locale: defaultLocale,
      view: { kind: 'not-found' },
      path: '/404.html',
      outputFile: '404.html',
      alternates: {},
      indexable: false,
      entry: 'site',
    },
  ];
}
