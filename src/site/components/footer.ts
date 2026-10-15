import { chapters } from '../../content/chapters.ts';
import { profile } from '../../content/profile.ts';
import { socialLinks } from '../../content/site.ts';
import { ui } from '../../content/ui.ts';
import { worlds } from '../../content/worlds.ts';
import { hirePath, projectPath, sectionPath } from '../../shared/i18n/paths.ts';
import { renderBrandMark } from '../brand.ts';
import { html, type SafeHtml } from '../html.ts';
import type { PageContext } from '../page.ts';
import { renderSecretMail } from './secret-mail.ts';

function renderLinkGroup(id: string, title: string, links: readonly SafeHtml[]): SafeHtml {
  return html`<nav class="site-footer__group" aria-labelledby="footer-${id}">
    <h2 class="site-footer__heading" id="footer-${id}">${title}</h2>
    <ul class="site-footer__links">${links}</ul>
  </nav>`;
}

export function renderFooter(context: PageContext): SafeHtml {
  const { locale } = context;
  const experience = chapters
    .filter((chapter) => chapter.id !== 'hero')
    .map(
      (chapter) =>
        html`<li><a href="${sectionPath(locale, chapter.anchor[locale])}">${chapter.label[locale]}</a></li>`,
    );
  const pages = [
    html`<li><a href="${hirePath(locale)}">${ui.navHire[locale]}</a></li>`,
    ...worlds
      .filter((world) => world.page !== null)
      .map(
        (world) =>
          html`<li><a href="${projectPath(locale, world.slug)}">${world.title[locale]}</a></li>`,
      ),
  ];
  const external = socialLinks.map(
    (link) =>
      html`<li><a href="${link.href}" rel="me noopener" target="_blank" data-cursor="${ui.cursorExternal[locale]}">${link.label[locale]}</a></li>`,
  );

  return html`<footer class="site-footer surface">
  <div class="site-footer__grid">
    <div class="site-footer__identity">
      ${renderBrandMark('site-footer__mark')}
      <p class="site-footer__name">${profile.name}</p>
      <p class="site-footer__role">${profile.role[locale]}</p>
      <p class="site-footer__location">${profile.location.label[locale]}</p>
      ${renderSecretMail(locale, 'footer')}
    </div>
    ${renderLinkGroup('experience', ui.footerExperience[locale], experience)}
    ${renderLinkGroup('pages', ui.footerPages[locale], pages)}
    ${renderLinkGroup('external', ui.footerNavigation[locale], external)}
  </div>
  <div class="site-footer__bottom">
    <p class="site-footer__legal"><small>© ${context.year} ${profile.name}. ${ui.footerRights[locale]}</small></p>
    <a class="site-footer__top" href="#main">${ui.backToTop[locale]} ↑</a>
  </div>
</footer>`;
}
