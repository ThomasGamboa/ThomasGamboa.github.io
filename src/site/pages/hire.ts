import { serviceCategories } from '../../content/services.ts';
import type { Service } from '../../content/types.ts';
import { ui } from '../../content/ui.ts';
import { formatPrice } from '../../shared/i18n/format.ts';
import type { Locale } from '../../shared/i18n/locales.ts';
import { html, type SafeHtml } from '../html.ts';
import type { PageContext, PageDocument } from '../page.ts';
import { hireStructuredData } from '../seo/structured-data.ts';

function renderPrice(service: Service, locale: Locale): SafeHtml {
  return service.startingPrice
    ? html`<p class="service__price"><span class="service__price-label">${ui.priceFrom[locale]}</span> <data value="${service.startingPrice.amount}">${formatPrice(service.startingPrice, locale)}</data></p>`
    : html`<p class="service__price">${ui.priceOnRequest[locale]}</p>`;
}

function renderService(service: Service, locale: Locale): SafeHtml {
  return html`<li class="service" data-service="${service.id}">
  <h4 class="service__name">${service.name[locale]}</h4>
  <p class="service__description">${service.description[locale]}</p>
  ${renderPrice(service, locale)}
  ${service.note ? html`<p class="service__note">${service.note[locale]}</p>` : null}
</li>`;
}

export function renderHirePage(context: PageContext): PageDocument {
  const { locale, route } = context;
  const title = ui.hireTitle[locale];
  const categories = serviceCategories.map(
    (
      category,
      index,
    ) => html`<section class="service-category" data-service-category="${category.id}" aria-labelledby="category-${category.id}">
  <h3 class="service-category__title" id="category-${category.id}"><span class="service-category__index" aria-hidden="true">${String.fromCharCode(65 + index)}</span> ${category.title[locale]}</h3>
  <ul class="service-category__list">${category.services.map((service) => renderService(service, locale))}</ul>
</section>`,
  );

  const main = html`<div class="page page--hire">
  <header class="page__header">
    <p class="eyebrow">${ui.hireEyebrow[locale]}</p>
    <h1 class="page__title">${ui.hireHeading[locale]}</h1>
    <p class="page__lead">${ui.hireIntro[locale]}</p>
  </header>
  <section class="services" aria-labelledby="services-title">
    <h2 id="services-title">${ui.servicesHeading[locale]}</h2>
    ${categories}
    <p class="services__disclaimer">${ui.pricingDisclaimer[locale]}</p>
  </section>
  <section class="request" aria-labelledby="request-title">
    <h2 id="request-title">${ui.requestHeading[locale]}</h2>
    <div class="request__mount" data-hire-form>
      <p>${ui.requestPending[locale]}</p>
    </div>
  </section>
</div>`;

  return {
    meta: {
      title,
      description: ui.hireDescription[locale],
      openGraphType: 'website',
      structuredData: hireStructuredData(locale, route.path, title),
    },
    main,
  };
}
