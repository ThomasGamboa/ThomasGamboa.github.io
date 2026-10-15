const holdMilliseconds = 2000;
const visibleMilliseconds = 15000;
const triggerKeys = new Set(['Enter', ' ']);

import { decodeMail } from './mail-code.ts';

function bind(root: HTMLElement): void {
  const button = root.querySelector<HTMLButtonElement>('[data-secret-reveal]');
  const value = root.querySelector<HTMLElement>('[data-secret-value]');
  const text = root.querySelector<HTMLElement>('[data-secret-text]');
  if (!button || !value || !text) {
    return;
  }
  const masked = value.textContent ?? '';
  const idle = text.textContent ?? '';
  let frame = 0;
  let start = 0;
  let timer = 0;

  const setProgress = (amount: number) => root.style.setProperty('--hold', amount.toFixed(3));

  const conceal = () => {
    root.removeAttribute('data-revealed');
    value.replaceChildren(masked);
    text.textContent = idle;
    setProgress(0);
  };

  const reveal = () => {
    const address = decodeMail(root);
    const link = document.createElement('a');
    link.href = `mailto:${address}`;
    link.textContent = address;
    value.replaceChildren(link);
    root.setAttribute('data-revealed', '');
    text.textContent = root.dataset.labelVisible ?? idle;
    window.clearTimeout(timer);
    timer = window.setTimeout(conceal, visibleMilliseconds);
  };

  const cancel = () => {
    if (frame === 0) {
      return;
    }
    cancelAnimationFrame(frame);
    frame = 0;
    root.removeAttribute('data-holding');
    setProgress(0);
  };

  const tick = (now: number) => {
    const progress = Math.min((now - start) / holdMilliseconds, 1);
    setProgress(progress);
    if (progress < 1) {
      frame = requestAnimationFrame(tick);
      return;
    }
    frame = 0;
    root.removeAttribute('data-holding');
    reveal();
  };

  const begin = (event: Event) => {
    if (!event.isTrusted || frame !== 0 || root.hasAttribute('data-revealed')) {
      return;
    }
    start = performance.now();
    root.setAttribute('data-holding', '');
    frame = requestAnimationFrame(tick);
  };

  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !event.isTrusted) {
      return;
    }
    button.setPointerCapture(event.pointerId);
    begin(event);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    button.addEventListener(type, cancel);
  }
  button.addEventListener('keydown', (event) => {
    if (!triggerKeys.has(event.key)) {
      return;
    }
    event.preventDefault();
    if (!event.repeat) {
      begin(event);
    }
  });
  button.addEventListener('keyup', (event) => {
    if (triggerKeys.has(event.key)) {
      cancel();
    }
  });
  button.addEventListener('blur', cancel);
  button.addEventListener('contextmenu', (event) => event.preventDefault());
}

export function bindSecretMail(scope: Document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-secret-mail]')) {
    bind(root);
  }
}
