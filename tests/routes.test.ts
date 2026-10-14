import { describe, expect, it } from 'vitest';
import { worlds } from '../src/content/worlds.ts';
import { locales } from '../src/shared/i18n/locales.ts';
import { hirePath, homePath, projectPath, sectionPath } from '../src/shared/i18n/paths.ts';
import { buildRoutes, outputFileFor } from '../src/site/routes.ts';

describe('localized paths', () => {
  it('keeps the default locale at the root and prefixes the others', () => {
    expect(homePath('es')).toBe('/');
    expect(homePath('en')).toBe('/en/');
    expect(hirePath('es')).toBe('/contratar/');
    expect(hirePath('en')).toBe('/en/hire/');
    expect(projectPath('es', 'voxelnest')).toBe('/proyectos/voxelnest/');
    expect(projectPath('en', 'voxelnest')).toBe('/en/projects/voxelnest/');
    expect(sectionPath('es', 'sobre-mi')).toBe('/#sobre-mi');
  });

  it('maps directory paths to index documents', () => {
    expect(outputFileFor('/')).toBe('index.html');
    expect(outputFileFor('/en/hire/')).toBe('en/hire/index.html');
    expect(outputFileFor('/404.html')).toBe('404.html');
  });
});

describe('route manifest', () => {
  const routes = buildRoutes();

  it('has unique ids, paths and output files', () => {
    for (const key of ['id', 'path', 'outputFile'] as const) {
      const values = routes.map((route) => route[key]);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it('declares reciprocal alternates for every indexable route', () => {
    for (const route of routes.filter((candidate) => candidate.indexable)) {
      for (const locale of locales) {
        const alternatePath = route.alternates[locale];
        expect(alternatePath, `${route.id} → ${locale}`).toBeDefined();
        const alternate = routes.find((candidate) => candidate.path === alternatePath);
        expect(alternate?.locale).toBe(locale);
        expect(alternate?.alternates).toEqual(route.alternates);
      }
    }
  });

  it('creates a page for every world that declares one', () => {
    const worldsWithPage = worlds.filter((world) => world.page !== null);
    const worldRoutes = routes.filter((route) => route.view.kind === 'world');
    expect(worldRoutes).toHaveLength(worldsWithPage.length * locales.length);
  });

  it('provides a single non-indexable 404 document at the root', () => {
    const notFound = routes.filter((route) => route.view.kind === 'not-found');
    expect(notFound).toHaveLength(1);
    expect(notFound[0]?.outputFile).toBe('404.html');
    expect(notFound[0]?.indexable).toBe(false);
  });
});
