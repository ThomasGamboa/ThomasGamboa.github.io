import { absoluteUrl } from '../../content/site.ts';
import { escapeHtml } from '../html.ts';
import type { Route } from '../routes.ts';

export interface SitemapImage {
  readonly url: string;
}

function sitemapEntry(
  route: Route,
  images: readonly SitemapImage[],
  lastModified: string | null,
): string {
  return [
    '  <url>',
    `    <loc>${escapeHtml(absoluteUrl(route.path))}</loc>`,
    ...(lastModified ? [`    <lastmod>${lastModified}</lastmod>`] : []),
    ...images.map(
      (image) => `    <image:image><image:loc>${escapeHtml(image.url)}</image:loc></image:image>`,
    ),
    '  </url>',
  ].join('\n');
}

export function renderSitemap(
  routes: readonly Route[],
  imagesFor: (route: Route) => readonly SitemapImage[] = () => [],
  lastModified: string | null = null,
): string {
  const entries = routes
    .filter((route) => route.indexable)
    .map((route) => sitemapEntry(route, imagesFor(route), lastModified));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
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
