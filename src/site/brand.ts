import { markHeight, markPath, markViewBox, markWidth } from '../shared/design/brand-mark.ts';
import { html, raw, type SafeHtml } from './html.ts';

export function renderBrandSymbol(): SafeHtml {
  return html`<svg class="brand-symbol" aria-hidden="true" focusable="false"><symbol id="brand-mark" viewBox="${markViewBox}"><path fill-rule="evenodd" d="${raw(markPath)}"/></symbol></svg>`;
}

export function renderBrandMark(className: string): SafeHtml {
  return html`<svg class="${className}" viewBox="${markViewBox}" aria-hidden="true" focusable="false"><use href="#brand-mark"></use></svg>`;
}

export function renderFavicon(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${markViewBox}"><path fill="${color}" fill-rule="evenodd" d="${markPath}"/></svg>
`;
}

export function renderMarkSvg(color: string, size: number, coverage: number): string {
  const scale = (size * coverage) / markHeight;
  const x = (size - markWidth * scale) / 2;
  const y = (size - markHeight * scale) / 2;
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)})"><path fill="${color}" fill-rule="evenodd" d="${markPath}"/></g>`;
}
