import { ui } from '../../content/ui.ts';
import { html, type SafeHtml } from '../html.ts';
import type { PageContext } from '../page.ts';

export function renderExperienceStage(context: PageContext): SafeHtml {
  const { locale } = context;
  return html`<div class="loader" data-loader role="progressbar" aria-label="${ui.loadingLabel[locale]}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
  <p class="loader__status">${ui.loadingStatus[locale]}</p>
  <p class="loader__value" aria-hidden="true"><span data-loader-value>000</span></p>
  <span class="loader__track" aria-hidden="true"><span class="loader__fill" data-loader-fill></span></span>
</div>
<canvas class="experience-canvas" data-experience-canvas aria-hidden="true"></canvas>`;
}
