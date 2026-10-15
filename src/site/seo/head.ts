import { absoluteUrl, site } from '../../content/site.ts';
import { localeDefinitions, locales, xDefaultLocale } from '../../shared/i18n/locales.ts';
import { html, jsonScript, type SafeHtml } from '../html.ts';
import type { PageContext, PageMeta } from '../page.ts';

function robotsDirective(context: PageContext): string {
  return site.indexable && context.route.indexable
    ? 'index, follow, max-image-preview:large'
    : 'noindex, follow';
}

function alternateLinks(context: PageContext): SafeHtml[] {
  const { alternates } = context.route;
  const links = locales.flatMap((locale) => {
    const path = alternates[locale];
    return path
      ? [
          html`<link rel="alternate" hreflang="${localeDefinitions[locale].hreflang}" href="${absoluteUrl(path)}">`,
        ]
      : [];
  });
  const xDefaultPath = alternates[xDefaultLocale];
  if (xDefaultPath) {
    links.push(
      html`<link rel="alternate" hreflang="x-default" href="${absoluteUrl(xDefaultPath)}">`,
    );
  }
  return links;
}

function openGraph(context: PageContext, meta: PageMeta): SafeHtml {
  const definition = localeDefinitions[context.locale];
  const image = absoluteUrl(meta.image?.url ?? `/og/thomas-gamboa-${context.locale}.jpg`);
  const imageAlt = meta.image?.alt ?? meta.title;
  const alternateLocales = locales
    .filter((locale) => locale !== context.locale && context.route.alternates[locale])
    .map(
      (locale) =>
        html`<meta property="og:locale:alternate" content="${localeDefinitions[locale].openGraphLocale}">`,
    );

  return html`<meta property="og:type" content="${meta.openGraphType}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:url" content="${absoluteUrl(context.route.path)}">
<meta property="og:locale" content="${definition.openGraphLocale}">
${alternateLocales}
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${imageAlt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${meta.title}">
<meta name="twitter:description" content="${meta.description}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${imageAlt}">`;
}

export function renderHead(context: PageContext, meta: PageMeta): SafeHtml {
  const canonical = context.route.indexable
    ? html`<link rel="canonical" href="${absoluteUrl(context.route.path)}">`
    : null;
  const verification = site.googleSiteVerification
    ? html`<meta name="google-site-verification" content="${site.googleSiteVerification}">`
    : null;

  return html`<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${meta.title}</title>
<meta name="description" content="${meta.description}">
<meta name="robots" content="${robotsDirective(context)}">
<meta name="author" content="${site.name}">
<meta name="theme-color" content="${site.themeColor}">
<meta name="color-scheme" content="dark">
${canonical}
${alternateLinks(context)}
${openGraph(context, meta)}
${verification}
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/icons/favicon-96.png" sizes="96x96" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<script>document.documentElement.classList.replace('no-js', 'js')</script>
${meta.structuredData ? jsonScript(meta.structuredData) : null}`;
}
