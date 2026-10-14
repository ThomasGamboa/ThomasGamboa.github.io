import { describe, expect, it } from 'vitest';
import { absoluteUrl } from '../src/content/site.ts';
import { escapeHtml, html, raw } from '../src/site/html.ts';
import { renderRoute } from '../src/site/render.ts';
import { buildRoutes } from '../src/site/routes.ts';
import { renderRobots, renderSitemap } from '../src/site/seo/indexing.ts';

const routes = buildRoutes();

function count(source: string, pattern: RegExp): number {
  return source.match(pattern)?.length ?? 0;
}

describe('html template', () => {
  it('escapes interpolated values and keeps trusted fragments', () => {
    const value = '<script>"x" & \'y\'</script>';
    expect(html`<p>${value}</p>`.value).toBe(`<p>${escapeHtml(value)}</p>`);
    expect(html`<p>${raw('<b>ok</b>')}</p>`.value).toBe('<p><b>ok</b></p>');
    expect(html`<p>${null}${false}${['a', 1]}</p>`.value).toBe('<p>a1</p>');
  });
});

describe('rendered documents', () => {
  for (const route of routes) {
    describe(route.id, () => {
      const document = renderRoute(route, new Date('2026-01-01T00:00:00Z'));

      it('declares language, title, description and robots', () => {
        expect(document.startsWith('<!doctype html>')).toBe(true);
        expect(document).toContain(`<html lang="${route.locale}"`);
        expect(count(document, /<title>[^<]+<\/title>/g)).toBe(1);
        expect(document).toMatch(/<meta name="description" content="[^"]{50,}">/);
        expect(document).toContain('<meta name="robots"');
      });

      it('has exactly one h1 and a main landmark', () => {
        expect(count(document, /<h1[\s>]/g)).toBe(1);
        expect(count(document, /<main[\s>]/g)).toBe(1);
      });

      it('links canonical and hreflang alternates when indexable', () => {
        if (!route.indexable) {
          expect(document).not.toContain('rel="canonical"');
          return;
        }
        expect(document).toContain(`<link rel="canonical" href="${absoluteUrl(route.path)}">`);
        expect(count(document, /hreflang="(es|en|x-default)"/g)).toBeGreaterThanOrEqual(3);
      });

      it('embeds valid structured data', () => {
        const match = document.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
        if (!match?.[1]) {
          return;
        }
        const data = JSON.parse(match[1]) as { '@context': string };
        expect(data['@context']).toBe('https://schema.org');
      });
    });
  }
});

describe('indexing files', () => {
  it('lists every indexable route with its alternates', () => {
    const sitemap = renderSitemap(routes);
    const indexable = routes.filter((route) => route.indexable);
    expect(count(sitemap, /<url>/g)).toBe(indexable.length);
    expect(sitemap).not.toContain('404.html');
    expect(sitemap).toContain('hreflang="x-default"');
  });

  it('points robots to the sitemap', () => {
    expect(renderRobots()).toContain(`Sitemap: ${absoluteUrl('/sitemap.xml')}`);
  });
});
