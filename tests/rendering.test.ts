import { describe, expect, it } from 'vitest';
import { absoluteUrl } from '../src/content/site.ts';
import { escapeHtml, html, raw } from '../src/site/html.ts';
import { mediaLibrary } from '../src/site/media.ts';
import { renderRoute } from '../src/site/render.ts';
import { buildRoutes } from '../src/site/routes.ts';
import { renderRobots, renderSitemap } from '../src/site/seo/indexing.ts';

await mediaLibrary.scan(process.cwd());

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

describe('navigation integrity', () => {
  const documents = new Map(
    routes.map((route) => [route.path, renderRoute(route, new Date('2026-01-01T00:00:00Z'))]),
  );

  function ids(document: string): string[] {
    return [...document.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1] ?? '');
  }

  it('never repeats an id within a document', () => {
    for (const [path, document] of documents) {
      const all = ids(document);
      expect(
        all.filter((id, index) => all.indexOf(id) !== index),
        path,
      ).toEqual([]);
    }
  });

  it('resolves every internal link to an existing page and anchor', () => {
    for (const [path, document] of documents) {
      for (const [, href] of document.matchAll(/href="(\/[^"]*)"/g)) {
        if (!href || href.startsWith('/src/') || /\.(ico|svg)$/.test(href)) {
          continue;
        }
        const [target = '', anchor] = href.split('#');
        const targetDocument = documents.get(target);
        expect(targetDocument, `${path} → ${href}`).toBeDefined();
        if (anchor && targetDocument) {
          expect(ids(targetDocument), `${path} → ${href}`).toContain(anchor);
        }
      }
    }
  });

  it('maps every chapter to an anchor in each language link of the experience', () => {
    const home = documents.get('/') ?? '';
    const anchorMaps = [...home.matchAll(/data-chapter-anchors="([^"]+)"/g)].map(
      (match) => JSON.parse((match[1] ?? '').replaceAll('&quot;', '"')) as Record<string, string>,
    );
    expect(anchorMaps).toHaveLength(2);
    const chapterIds = [...home.matchAll(/data-chapter="([^"]+)"/g)].map((match) => match[1]);
    for (const anchors of anchorMaps) {
      expect(Object.keys(anchors).sort()).toEqual([...chapterIds].sort());
    }
  });

  it('wires the index popover and the SVG favicon on every page', () => {
    for (const [path, document] of documents) {
      expect(count(document, /id="site-menu"[^>]*popover/g), path).toBe(1);
      expect(document, path).toContain('popovertarget="site-menu"');
      expect(document, path).toContain('href="/favicon.svg"');
    }
  });
});
