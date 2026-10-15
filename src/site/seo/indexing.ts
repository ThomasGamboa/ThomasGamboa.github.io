import { absoluteUrl } from '../../content/site.ts';
import { localeDefinitions, locales, xDefaultLocale } from '../../shared/i18n/locales.ts';
import { escapeHtml } from '../html.ts';
import type { Route } from '../routes.ts';

export interface SitemapImage {
  readonly url: string;
}

function sitemapEntry(route: Route, images: readonly SitemapImage[]): string {
  const alternates = locales.flatMap((locale) => {
    const path = route.alternates[locale];
    return path
      ? [
          `    <xhtml:link rel="alternate" hreflang="${localeDefinitions[locale].hreflang}" href="${escapeHtml(absoluteUrl(path))}"/>`,
        ]
      : [];
  });
  const xDefaultPath = route.alternates[xDefaultLocale];
  if (xDefaultPath) {
    alternates.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteUrl(xDefaultPath))}"/>`,
    );
  }
  return [
    '  <url>',
    `    <loc>${escapeHtml(absoluteUrl(route.path))}</loc>`,
    ...alternates,
    ...images.map(
      (image) => `    <image:image><image:loc>${escapeHtml(image.url)}</image:loc></image:image>`,
    ),
    '  </url>',
  ].join('\n');
}

export function renderSitemap(
  routes: readonly Route[],
  imagesFor: (route: Route) => readonly SitemapImage[] = () => [],
): string {
  const entries = routes
    .filter((route) => route.indexable)
    .map((route) => sitemapEntry(route, imagesFor(route)));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

export function renderRobots(): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${absoluteUrl('/sitemap.xml')}`, ''].join(
    '\n',
  );
}
