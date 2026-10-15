import { chapters } from '../../content/chapters.ts';
import { site } from '../../content/site.ts';
import { ui } from '../../content/ui.ts';
import { type Locale, localeDefinitions, locales } from '../../shared/i18n/locales.ts';
import { hirePath, homePath } from '../../shared/i18n/paths.ts';
import { renderBrandMark } from '../brand.ts';
import { attributes, html, type SafeHtml } from '../html.ts';
import type { PageContext } from '../page.ts';

function chapterAnchorsFor(context: PageContext, locale: Locale): string | null {
  if (context.route.view.kind !== 'home') {
    return null;
  }
  return JSON.stringify(
    Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter.anchor[locale]])),
  );
}

function renderLanguageSwitch(context: PageContext): SafeHtml {
  const items = locales.map((locale) => {
    const definition = localeDefinitions[locale];
    const href = context.route.alternates[locale] ?? homePath(locale);
    return html`<li><a${attributes({
      class: 'language-switch__link',
      href,
      hreflang: definition.hreflang,
      lang: definition.htmlLang,
      'aria-label': definition.label,
      'aria-current': locale === context.locale ? 'true' : null,
      'data-tooltip': definition.label,
      'data-language-link': locale,
      'data-chapter-anchors': chapterAnchorsFor(context, locale),
    })}>${definition.shortLabel}</a></li>`;
  });

  return html`<nav class="language-switch" aria-label="${ui.languageNavigation[context.locale]}">
  <ul class="language-switch__list">${items}</ul>
</nav>`;
}

export function renderHeader(context: PageContext): SafeHtml {
  const { locale } = context;

  return html`<header class="site-header">
  <a class="brand" href="${homePath(locale)}" aria-label="${ui.homeLinkLabel[locale]}">
    ${renderBrandMark('brand__mark')}
    <span class="brand__name" aria-hidden="true">${site.name}</span>
  </a>
  <a class="site-header__action" href="${hirePath(locale)}" data-cursor="${ui.cursorStart[locale]}">${ui.navHire[locale]}</a>
  ${renderLanguageSwitch(context)}
  <button class="menu-toggle" type="button" popovertarget="site-menu" aria-controls="site-menu">
    <span class="menu-toggle__label">${ui.menuToggle[locale]}</span>
    <span class="menu-toggle__glyph" aria-hidden="true"></span>
  </button>
</header>`;
}
