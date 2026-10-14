import { chapterAnchor } from '../../content/chapters.ts';
import { site } from '../../content/site.ts';
import { ui } from '../../content/ui.ts';
import { worlds } from '../../content/worlds.ts';
import { localeDefinitions, locales } from '../../shared/i18n/locales.ts';
import { hirePath, homePath, sectionPath } from '../../shared/i18n/paths.ts';
import { attributes, html, type SafeHtml } from '../html.ts';
import type { PageContext } from '../page.ts';

function languageSwitch(context: PageContext): SafeHtml {
  const items = locales.map((locale) => {
    const definition = localeDefinitions[locale];
    const href = context.route.alternates[locale] ?? homePath(locale);
    const current = locale === context.locale;
    return html`<li><a${attributes({
      href,
      hreflang: definition.hreflang,
      lang: definition.htmlLang,
      title: definition.label,
      'aria-current': current ? 'true' : null,
      'data-language-link': locale,
    })}>${definition.shortLabel}</a></li>`;
  });

  return html`<nav class="language-switch" aria-label="${ui.languageNavigation[context.locale]}">
  <ul class="language-switch__list">${items}</ul>
</nav>`;
}

export function renderHeader(context: PageContext): SafeHtml {
  const { locale } = context;
  const firstWorld = worlds[0];
  const navigation = [
    { href: sectionPath(locale, chapterAnchor('about')[locale]), label: ui.navAbout[locale] },
    firstWorld
      ? { href: sectionPath(locale, firstWorld.anchor[locale]), label: ui.navProjects[locale] }
      : null,
    { href: sectionPath(locale, chapterAnchor('contact')[locale]), label: ui.navContact[locale] },
  ].filter((item) => item !== null);

  return html`<header class="site-header" data-site-header>
  <a class="site-header__brand" href="${homePath(locale)}" aria-label="${ui.homeLinkLabel[locale]}">${site.name}</a>
  <nav class="site-header__navigation" aria-label="${ui.primaryNavigation[locale]}">
    <ol class="site-header__list">${navigation.map((item) => html`<li><a href="${item.href}">${item.label}</a></li>`)}</ol>
  </nav>
  <a class="site-header__action" href="${hirePath(locale)}">${ui.navHire[locale]}</a>
  ${languageSwitch(context)}
</header>`;
}
