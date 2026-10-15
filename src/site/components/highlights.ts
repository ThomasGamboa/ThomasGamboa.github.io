import type { Highlight } from '../../content/types.ts';
import { ui } from '../../content/ui.ts';
import type { Locale } from '../../shared/i18n/locales.ts';
import { html, type SafeHtml } from '../html.ts';

export function renderHighlights(
  highlights: readonly Highlight[],
  locale: Locale,
): SafeHtml | null {
  if (highlights.length === 0) {
    return null;
  }
  return html`<dl class="highlights" aria-label="${ui.worldHighlights[locale]}">
  ${highlights.map(
    (highlight) => html`<div class="highlights__item">
    <dt>${highlight.label[locale]}</dt>
    <dd>${highlight.value}</dd>
  </div>`,
  )}
</dl>`;
}
