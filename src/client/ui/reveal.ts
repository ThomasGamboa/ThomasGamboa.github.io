import { refract } from './refraction.ts';

const lineDelay = 90;
const wordDelay = 14;

function splitWords(element: HTMLElement): HTMLElement[] {
  const words: HTMLElement[] = [];
  const fragment = document.createDocumentFragment();
  for (const part of (element.textContent ?? '').split(/(\s+)/)) {
    if (part === '') {
      continue;
    }
    if (/^\s+$/.test(part)) {
      fragment.append(document.createTextNode(part));
      continue;
    }
    const word = document.createElement('span');
    word.className = 'reveal-word';
    word.textContent = part;
    fragment.append(word);
    words.push(word);
  }
  element.replaceChildren(fragment);
  return words;
}

function assignDelays(words: readonly HTMLElement[]): void {
  let line = -1;
  let lineTop = Number.NaN;
  let positionInLine = 0;
  for (const word of words) {
    if (word.offsetTop !== lineTop) {
      lineTop = word.offsetTop;
      line += 1;
      positionInLine = 0;
    }
    word.style.setProperty('--reveal-delay', `${line * lineDelay + positionInLine * wordDelay}ms`);
    positionInLine += 1;
  }
}

export function revealOnScroll(scope: ParentNode): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    return;
  }

  const wordsByElement = new Map<Element, HTMLElement[]>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        observer.unobserve(entry.target);
        assignDelays(wordsByElement.get(entry.target) ?? []);
        const element = entry.target as HTMLElement;
        element.dataset.revealState = 'visible';
        if (/^H[1-6]$/.test(element.tagName)) {
          refract(element, { strength: 10, duration: 1200 });
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );

  const fold = window.innerHeight;
  for (const element of scope.querySelectorAll<HTMLElement>('[data-reveal]')) {
    if (element.children.length > 0 || element.getBoundingClientRect().top < fold) {
      continue;
    }
    wordsByElement.set(element, splitWords(element));
    element.dataset.revealState = 'pending';
    observer.observe(element);
  }
}
