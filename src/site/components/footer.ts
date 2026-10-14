import { profile } from '../../content/profile.ts';
import { socialLinks } from '../../content/site.ts';
import { ui } from '../../content/ui.ts';
import { html, type SafeHtml } from '../html.ts';
import type { PageContext } from '../page.ts';

export function renderFooter(context: PageContext): SafeHtml {
  const { locale } = context;
  const links = socialLinks.map(
    (link) =>
      html`<li><a href="${link.href}" rel="me noopener" target="_blank">${link.label[locale]}</a></li>`,
  );

  return html`<footer class="site-footer">
  <p class="site-footer__identity">
    <span class="site-footer__name">${profile.name}</span>
    <span class="site-footer__role">${profile.role[locale]}</span>
    <span class="site-footer__location">${profile.location.label[locale]}</span>
  </p>
  <nav class="site-footer__navigation" aria-label="${ui.footerNavigation[locale]}">
    <ul class="site-footer__links">${links}</ul>
  </nav>
  <p class="site-footer__legal"><small>© ${context.year} ${profile.name}. ${ui.footerRights[locale]}</small></p>
</footer>`;
}
