import { hiring } from '../../content/site.ts';
import { ui } from '../../content/ui.ts';
import { renderHireForm } from '../components/hire-form.ts';
import { html } from '../html.ts';
import type { PageContext, PageDocument } from '../page.ts';
import { hireStructuredData } from '../seo/structured-data.ts';

export function renderHirePage(context: PageContext): PageDocument {
  const { locale, route } = context;
  const title = ui.hireTitle[locale];
  const endpoint = process.env.PUBLIC_HIRE_ENDPOINT || hiring.endpoint;
  const siteKey = process.env.PUBLIC_TURNSTILE_SITE_KEY || hiring.turnstileSiteKey;

  const main = html`<div class="page page--hire">
  <header class="page__header">
    <p class="eyebrow">${ui.hireEyebrow[locale]}</p>
    <h1 class="page__title" data-reveal>${ui.hireHeading[locale]}</h1>
    <p class="page__lead">${ui.hireIntro[locale]}</p>
  </header>
  ${renderHireForm({ locale, endpoint, siteKey })}
</div>`;

  return {
    meta: {
      title,
      description: ui.hireDescription[locale],
      openGraphType: 'website',
      structuredData: hireStructuredData(locale, route.path, title),
    },
    label: ui.hireEyebrow[locale],
    main,
  };
}
