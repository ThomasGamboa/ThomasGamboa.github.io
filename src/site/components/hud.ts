import { chapters } from '../../content/chapters.ts';
import { profile } from '../../content/profile.ts';
import { ui } from '../../content/ui.ts';
import { formatIndex } from '../../shared/i18n/format.ts';
import { sectionPath } from '../../shared/i18n/paths.ts';
import { html, type SafeHtml } from '../html.ts';
import type { PageContext } from '../page.ts';

function formatCoordinate(value: number, positive: string, negative: string): string {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
}

function renderChapterRail(context: PageContext): SafeHtml {
  const { locale } = context;
  const items = chapters.map(
    (
      chapter,
      index,
    ) => html`<li><a class="chapter-rail__link" href="${sectionPath(locale, chapter.anchor[locale])}" data-chapter-link="${chapter.id}" data-tooltip="${chapter.label[locale]}">
      <span class="chapter-rail__index">${formatIndex(index + 1)}</span><span class="visually-hidden"> ${chapter.label[locale]}</span>
    </a></li>`,
  );
  return html`<nav class="chapter-rail surface" aria-label="${ui.chapterNavigation[locale]}">
  <ol class="chapter-rail__list">${items}</ol>
</nav>`;
}

export function renderHud(context: PageContext, label: string): SafeHtml {
  const { location } = profile;
  const isHome = context.route.view.kind === 'home';
  const total = isHome ? formatIndex(chapters.length) : null;

  return html`<div class="hud surface" data-hud aria-hidden="true">
  <div class="hud__readout hud__readout--location">
    <span class="hud__label">${location.label[context.locale]}</span>
    <span class="hud__value">${formatCoordinate(location.latitude, 'N', 'S')} · ${formatCoordinate(location.longitude, 'E', 'W')}</span>
    <span class="hud__value"><span data-hud-clock data-time-zone="${location.timeZone}">--:--:--</span> ${location.utcOffsetLabel}</span>
  </div>
  <div class="hud__readout hud__readout--progress">
    <span class="hud__label">${total ? html`<span data-hud-index>01</span> / ${total}` : null}</span>
    <span class="hud__value hud__value--chapter" data-hud-chapter>${label}</span>
    <span class="hud__meter"><span class="hud__meter-fill" data-hud-meter></span></span>
    <span class="hud__value" data-hud-progress>000</span>
  </div>
</div>
${isHome ? renderChapterRail(context) : null}`;
}
