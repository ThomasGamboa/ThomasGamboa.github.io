import type { World } from '../../content/types.ts';
import { ui } from '../../content/ui.ts';
import { sectionPath } from '../../shared/i18n/paths.ts';
import { renderContentBlocks } from '../components/content-blocks.ts';
import { html } from '../html.ts';
import type { PageContext, PageDocument } from '../page.ts';
import { worldStructuredData } from '../seo/structured-data.ts';

export function renderWorldPage(context: PageContext, world: World): PageDocument {
  const { locale, route } = context;
  const seo = world.page?.seo;

  const main = html`<article class="page page--world surface" data-world="${world.id}" aria-labelledby="world-title">
  <header class="page__header">
    <p class="eyebrow">${world.eyebrow[locale]}</p>
    <h1 class="page__title" id="world-title" data-reveal>${world.title[locale]}</h1>
    <p class="page__lead">${world.summary[locale]}</p>
  </header>
  ${renderContentBlocks(world.blocks, locale)}
  <nav class="page__return">
    <a href="${sectionPath(locale, world.anchor[locale])}">${ui.backToExperience[locale]}</a>
  </nav>
</article>`;

  return {
    meta: {
      title: seo ? seo.title[locale] : world.title[locale],
      description: seo ? seo.description[locale] : world.summary[locale],
      openGraphType: 'article',
      structuredData: worldStructuredData(locale, route.path, world),
    },
    label: world.title[locale],
    main,
  };
}
