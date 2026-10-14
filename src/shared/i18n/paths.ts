import { type Locale, type Localized, localeDefinitions } from './locales.ts';

export const pathSegments = {
  hire: { es: 'contratar', en: 'hire' },
  projects: { es: 'proyectos', en: 'projects' },
} as const satisfies Record<string, Localized<string>>;

function withLocalePrefix(locale: Locale, path: string): string {
  return `${localeDefinitions[locale].pathPrefix}${path}`;
}

export function homePath(locale: Locale): string {
  return withLocalePrefix(locale, '/');
}

export function hirePath(locale: Locale): string {
  return withLocalePrefix(locale, `/${pathSegments.hire[locale]}/`);
}

export function projectPath(locale: Locale, slug: string): string {
  return withLocalePrefix(locale, `/${pathSegments.projects[locale]}/${slug}/`);
}

export function sectionPath(locale: Locale, anchor: string): string {
  return `${homePath(locale)}#${anchor}`;
}
