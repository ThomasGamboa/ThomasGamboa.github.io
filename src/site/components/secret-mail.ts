import { contactMail } from '../../content/site.ts';
import { ui } from '../../content/ui.ts';
import type { Locale } from '../../shared/i18n/locales.ts';
import { attributes, html, type SafeHtml } from '../html.ts';

const key = 0x4d;
const stride = 7;

function reverse(value: string): string {
  return [...value].reverse().join('');
}

function encode(value: string): string {
  return [...value]
    .map((char, index) => ((char.charCodeAt(0) ^ (key + index * stride)) & 0xff).toString(36))
    .join('.');
}

function mask(): string {
  const user = reverse(contactMail.user);
  const host = reverse(contactMail.host);
  const dot = host.lastIndexOf('.');
  const name = dot > 0 ? host.slice(0, dot) : host;
  const suffix = dot > 0 ? host.slice(dot) : '';
  return `${user.slice(0, 4)}${'•'.repeat(Math.max(user.length - 4, 3))}@${name.slice(0, 1)}${'•'.repeat(Math.max(name.length - 1, 3))}${suffix}`;
}

export function mailPayload() {
  return {
    'data-mail': encode(`${contactMail.user}|${contactMail.host}`),
    'data-mail-key': key,
    'data-mail-stride': stride,
  };
}

export function renderSecretMail(locale: Locale, scope: string): SafeHtml {
  const hintId = `mail-hint-${scope}`;
  return html`<div class="secret-mail" data-secret-mail${attributes(mailPayload())} data-label-visible="${ui.mailVisible[locale]}">
  <span class="secret-mail__label">${ui.mailLabel[locale]}</span>
  <span class="secret-mail__value" data-secret-value aria-live="polite">${mask()}</span>
  <button class="secret-mail__button" type="button" data-secret-reveal data-cursor="${ui.cursorHold[locale]}" aria-describedby="${hintId}">
    <span class="secret-mail__fill" aria-hidden="true"></span>
    <span class="secret-mail__text" data-secret-text>${ui.mailHold[locale]}</span>
  </button>
  <span class="visually-hidden" id="${hintId}">${ui.mailHint[locale]}</span>
</div>`;
}
