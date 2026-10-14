import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chapters } from '../src/content/chapters.ts';
import { profile } from '../src/content/profile.ts';
import { archiveProjects } from '../src/content/projects.ts';
import { findService, serviceCategories } from '../src/content/services.ts';
import { socialLinks } from '../src/content/site.ts';
import { ui } from '../src/content/ui.ts';
import { worlds } from '../src/content/worlds.ts';
import { palette } from '../src/shared/design/palette.ts';
import { locales } from '../src/shared/i18n/locales.ts';

const localeKeys = [...locales].sort().join(',');

function isLocalizedRecord(value: object): value is Record<string, unknown> {
  return Object.keys(value).sort().join(',') === localeKeys;
}

function collectLocalizedGaps(value: unknown, path: string, gaps: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectLocalizedGaps(item, `${path}[${index}]`, gaps);
    });
    return;
  }
  if (value === null || typeof value !== 'object') {
    return;
  }
  if (isLocalizedRecord(value)) {
    const lengths = new Set<number>();
    for (const locale of locales) {
      const entry = value[locale];
      if (typeof entry === 'string' && entry.trim() === '') {
        gaps.push(`${path}.${locale} is empty`);
      }
      if (Array.isArray(entry)) {
        lengths.add(entry.length);
      }
    }
    if (lengths.size > 1) {
      gaps.push(`${path} has different list lengths per locale`);
    }
  }
  for (const [key, child] of Object.entries(value)) {
    collectLocalizedGaps(child, `${path}.${key}`, gaps);
  }
}

function duplicates(values: readonly string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

describe('content integrity', () => {
  it('has complete translations for every locale', () => {
    const gaps: string[] = [];
    const sources = {
      ui,
      profile,
      worlds,
      archiveProjects,
      serviceCategories,
      socialLinks,
      chapters,
    };
    for (const [name, source] of Object.entries(sources)) {
      collectLocalizedGaps(source, name, gaps);
    }
    expect(gaps).toEqual([]);
  });

  it('uses unique identifiers and anchors', () => {
    expect(duplicates(worlds.map((world) => world.id))).toEqual([]);
    expect(duplicates(worlds.map((world) => world.slug))).toEqual([]);
    expect(duplicates(archiveProjects.map((project) => project.id))).toEqual([]);
    const serviceIds = serviceCategories.flatMap((category) =>
      category.services.map((service) => service.id),
    );
    expect(duplicates(serviceIds)).toEqual([]);
    for (const locale of locales) {
      expect(duplicates(chapters.map((chapter) => chapter.anchor[locale]))).toEqual([]);
    }
  });

  it('only references existing projects and services', () => {
    const projectIds = new Set(archiveProjects.map((project) => project.id));
    for (const world of worlds) {
      for (const id of world.projectIds) {
        expect(projectIds.has(id), `${world.id} → ${id}`).toBe(true);
      }
    }
    for (const category of serviceCategories) {
      for (const service of category.services) {
        for (const requirement of service.requirements) {
          expect(findService(requirement.alternativeServiceId)).toBeDefined();
        }
      }
    }
  });

  it('keeps starting prices positive and URLs absolute', () => {
    for (const category of serviceCategories) {
      for (const service of category.services) {
        if (service.startingPrice) {
          expect(service.startingPrice.amount).toBeGreaterThan(0);
        }
      }
    }
    const links = [...socialLinks, ...archiveProjects.flatMap((project) => project.links)];
    for (const link of links) {
      expect(new URL(link.href).protocol).toBe('https:');
    }
  });

  it('mirrors the shared palette in the CSS tokens', () => {
    const tokens = readFileSync(
      new URL('../src/client/styles/tokens.css', import.meta.url),
      'utf8',
    );
    expect(tokens).toContain(`--color-void: ${palette.void};`);
    expect(tokens).toContain(`--color-signal: ${palette.signal};`);
  });
});
