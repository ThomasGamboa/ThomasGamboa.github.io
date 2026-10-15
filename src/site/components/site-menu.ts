import { chapters } from '../../content/chapters.ts';
import { socialLinks } from '../../content/site.ts';
import { ui } from '../../content/ui.ts';
import { worlds } from '../../content/worlds.ts';
import { formatIndex } from '../../shared/i18n/format.ts';
import { hirePath, projectPath, sectionPath } from '../../shared/i18n/paths.ts';
import { html, type SafeHtml } from '../html.ts';
import type { PageContext } from '../page.ts';

export function renderSiteMenu(context: PageContext): SafeHtml {
  const { locale } = context;

  const chapterItems = chapters.map(
    (
      chapter,
      index,
    ) => html`<li><a class="site-menu__chapter" href="${sectionPath(locale, chapter.anchor[locale])}" data-chapter-link="${chapter.id}">
      <span class="site-menu__index">${formatIndex(index + 1)}</span>
      <span class="site-menu__label">${chapter.label[locale]}</span>
    </a></li>`,
  );

  const worldPages = worlds
    .filter((world) => world.page !== null)
    .map(
      (world) =>
        html`<li><a href="${projectPath(locale, world.slug)}">${world.title[locale]}</a></li>`,
    );

  const externalLinks = socialLinks.map(
    (link) =>
      html`<li><a href="${link.href}" rel="me noopener" target="_blank" data-cursor="${ui.cursorExternal[locale]}">${link.label[locale]}</a></li>`,
  );

  return html`<nav id="site-menu" class="site-menu" popover aria-label="${ui.menuLabel[locale]}">
  <div class="site-menu__frame">
    <ol class="site-menu__chapters">${chapterItems}</ol>
    <div class="site-menu__aside">
      <section class="site-menu__group" aria-labelledby="site-menu-worlds">
        <h2 class="site-menu__heading" id="site-menu-worlds">${ui.menuWorlds[locale]}</h2>
        <ul>${worldPages}<li><a href="${hirePath(locale)}">${ui.navHire[locale]}</a></li></ul>
      </section>
      <section class="site-menu__group" aria-labelledby="site-menu-elsewhere">
        <h2 class="site-menu__heading" id="site-menu-elsewhere">${ui.menuElsewhere[locale]}</h2>
        <ul>${externalLinks}</ul>
      </section>
    </div>
    <button class="site-menu__close" type="button" popovertarget="site-menu" popovertargetaction="hide">${ui.menuClose[locale]}</button>
  </div>
</nav>`;
}
