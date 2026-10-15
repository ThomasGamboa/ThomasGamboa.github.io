import type { ContentBlock } from '../../content/types.ts';
import { ui } from '../../content/ui.ts';
import { formatIndex, formatStorePrice } from '../../shared/i18n/format.ts';
import type { Locale } from '../../shared/i18n/locales.ts';
import { html, type SafeHtml } from '../html.ts';
import { mediaLibrary } from '../media.ts';

const embedOrigins = {
  youtube: (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
  vimeo: (id: string) => `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`,
} as const;

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
  <ul>${block.items.map((link) => html`<li><a href="${link.href}" rel="noopener" target="_blank" data-cursor="${ui.cursorExternal[locale]}">${link.label[locale]}</a></li>`)}</ul>
</section>`;
    case 'media':
      return html`<figure class="content-block content-block--media content-block--${block.layout}">
  ${mediaLibrary.picture(block.image, locale, { sizes: block.layout === 'wide' ? '100vw' : '(min-width: 64rem) 60vw, 100vw' })}
  ${block.caption ? html`<figcaption>${block.caption[locale]}</figcaption>` : null}
</figure>`;
    case 'gallery':
      return html`<section class="content-block content-block--gallery" data-gallery data-label-close="${ui.galleryClose[locale]}" data-label-previous="${ui.galleryPrevious[locale]}" data-label-next="${ui.galleryNext[locale]}">
  ${block.heading ? html`<h2>${block.heading[locale]}</h2>` : null}
  <ul class="gallery">${block.items.map(
    (item, index) => html`<li class="gallery__item">
    <button class="gallery__trigger" type="button" data-gallery-index="${index}" data-cursor="${ui.cursorExpand[locale]}" aria-label="${item.alt[locale]}">
      ${mediaLibrary.picture(item, locale, { sizes: '(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw' })}
      <span class="gallery__index" aria-hidden="true">${formatIndex(index + 1)}</span>
    </button>
  </li>`,
  )}</ul>
</section>`;
    case 'video':
      return html`<section class="content-block content-block--video">
  ${block.heading ? html`<h2>${block.heading[locale]}</h2>` : null}
  <div class="video" data-video-embed="${embedOrigins[block.provider](block.id)}" data-video-title="${block.title[locale]}">
    ${mediaLibrary.picture(block.poster, locale, { sizes: '(min-width: 64rem) 70vw, 100vw' })}
    <button class="video__play" type="button" data-cursor="${ui.cursorPlay[locale]}">${ui.playVideo[locale]}: ${block.title[locale]}</button>
  </div>
</section>`;
    case 'process':
      return html`<section class="content-block content-block--process">
  <h2>${block.heading[locale]}</h2>
  <ol class="process">${block.steps.map(
    (step, index) => html`<li class="process__step">
    <span class="process__index" aria-hidden="true">${formatIndex(index + 1)}</span>
    <h3>${step.title[locale]}</h3>
    <p>${step.body[locale]}</p>
  </li>`,
  )}</ol>
</section>`;
    case 'catalog':
      return html`<section class="content-block content-block--catalog">
  <h2>${block.heading[locale]}</h2>
  <ul class="catalog">${block.items.map(
    (item) => html`<li class="catalog__item">
    <article class="catalog__card">
      <p class="catalog__meta"><span>${item.category[locale]}</span><span class="catalog__price">${item.price ? formatStorePrice(item.price, locale) : ui.catalogFree[locale]}</span></p>
      <h3 class="catalog__title">${item.title}</h3>
      <p class="catalog__summary">${item.summary[locale]}</p>
      <ul class="catalog__links">${item.links.map((link) => html`<li><a href="${link.href}" rel="noopener" target="_blank" data-cursor="${ui.cursorExternal[locale]}" aria-label="${item.title}, ${link.label[locale]}">${link.label[locale]} <span aria-hidden="true">↗</span></a></li>`)}</ul>
    </article>
  </li>`,
  )}</ul>
</section>`;
  }
}

export function renderContentBlocks(blocks: readonly ContentBlock[], locale: Locale): SafeHtml {
  return html`${blocks.map((block) => renderBlock(block, locale))}`;
}
