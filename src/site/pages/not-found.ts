import { site } from '../../content/site.ts';
import { ui } from '../../content/ui.ts';
import { localeDefinitions, locales } from '../../shared/i18n/locales.ts';
import { homePath } from '../../shared/i18n/paths.ts';
import { html } from '../html.ts';
import type { PageContext, PageDocument } from '../page.ts';

export function renderNotFoundPage(context: PageContext): PageDocument {
  const { locale } = context;
  const alternatives = locales
    .filter((candidate) => candidate !== locale)
    .map(
      (candidate) =>
        html`<p lang="${localeDefinitions[candidate].htmlLang}">${ui.notFoundBody[candidate]} <a href="${homePath(candidate)}">${ui.notFoundAction[candidate]}</a></p>`,
    );

  const main = html`<div class="page page--not-found">
  <header class="page__header">
    <p class="eyebrow">${ui.notFoundEyebrow[locale]}</p>
    <h1 class="page__title">${ui.notFoundHeading[locale]}</h1>
    <p class="page__lead">${ui.notFoundBody[locale]}</p>
  </header>
  <a class="page__action" href="${homePath(locale)}">${ui.notFoundAction[locale]}</a>
  ${alternatives}
</div>`;

  return {
    meta: {
      title: `${ui.notFoundTitle[locale]} — ${site.name}`,
      description: ui.notFoundBody[locale],
      openGraphType: 'website',
      structuredData: null,
    },
    label: ui.notFoundEyebrow[locale],
    main,
  };
}
