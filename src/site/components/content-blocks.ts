import type { ContentBlock } from '../../content/types.ts';
import type { Locale } from '../../shared/i18n/locales.ts';
import { html, type SafeHtml } from '../html.ts';

function renderBlock(block: ContentBlock, locale: Locale): SafeHtml {
  switch (block.type) {
    case 'text':
      return html`<section class="content-block content-block--text">
  ${block.heading ? html`<h2>${block.heading[locale]}</h2>` : null}
  ${block.paragraphs[locale].map((paragraph) => html`<p>${paragraph}</p>`)}
</section>`;
    case 'stack':
      return html`<section class="content-block content-block--stack">
  <h2>${block.heading[locale]}</h2>
  <ul>${block.items.map((item) => html`<li>${item}</li>`)}</ul>
</section>`;
    case 'links':
      return html`<section class="content-block content-block--links">
  <h2>${block.heading[locale]}</h2>
  <ul>${block.items.map((link) => html`<li><a href="${link.href}" rel="noopener" target="_blank">${link.label[locale]}</a></li>`)}</ul>
</section>`;
  }
}

export function renderContentBlocks(blocks: readonly ContentBlock[], locale: Locale): SafeHtml {
  return html`${blocks.map((block) => renderBlock(block, locale))}`;
}
