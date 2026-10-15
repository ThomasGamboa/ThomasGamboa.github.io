import { ui } from '../../content/ui.ts';
import { localeDefinitions } from '../../shared/i18n/locales.ts';
import { renderBrandSymbol } from '../brand.ts';
import { renderFooter } from '../components/footer.ts';
import { renderHeader } from '../components/header.ts';
import { renderHud } from '../components/hud.ts';
import { renderSiteMenu } from '../components/site-menu.ts';
import { html } from '../html.ts';
import type { PageContext, PageDocument } from '../page.ts';
import { clientEntries } from '../routes.ts';
import { renderHead } from '../seo/head.ts';

export function renderDocument(context: PageContext, page: PageDocument): string {
  const { locale, route } = context;
  const definition = localeDefinitions[locale];

  const document = html`<html lang="${definition.htmlLang}" dir="ltr" class="no-js" data-page="${route.view.kind}">
<head>
${renderHead(context, page.meta)}
</head>
<body>
${renderBrandSymbol()}
<a class="skip-link" href="#main">${ui.skipToContent[locale]}</a>
${page.overlay ?? null}
${renderHud(context, page.label)}
${renderHeader(context)}
${renderSiteMenu(context)}
<main id="main" class="site-main" tabindex="-1">
${page.main}
</main>
${renderFooter(context)}
<script type="module" src="${clientEntries[route.entry]}"></script>
</body>
</html>`;

  return `<!doctype html>\n${document.value}\n`;
}
