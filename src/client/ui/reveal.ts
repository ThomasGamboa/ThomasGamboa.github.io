import { refract } from './refraction.ts';

const lineDelay = 90;
const settleMilliseconds = 1200;

function measureLines(element: HTMLElement, text: string): string[] {
  const probes: HTMLElement[] = [];
  const fragment = document.createDocumentFragment();
  for (const part of text.split(/(\s+)/)) {
    if (part === '') {
      continue;
    }
    if (/^\s+$/.test(part)) {
      fragment.append(document.createTextNode(part));
      continue;
    }
    const probe = document.createElement('span');
    probe.textContent = part;
    fragment.append(probe);
    probes.push(probe);
  }
  element.replaceChildren(fragment);
  const lines: string[][] = [];
  let lineTop = Number.NaN;
  for (const probe of probes) {
    if (probe.offsetTop !== lineTop) {
      lineTop = probe.offsetTop;
      lines.push([]);
    }
    lines.at(-1)?.push(probe.textContent ?? '');
  }
  return lines.map((words) => words.join(' '));
}

function reveal(element: HTMLElement): void {
  const text = element.textContent ?? '';
  const lines = measureLines(element, text).map((content, index) => {
    const line = document.createElement('span');
    line.className = 'reveal-line';
    line.textContent = content;
    line.style.setProperty('--reveal-delay', `${index * lineDelay}ms`);
    return line;
  });
  element.replaceChildren(...lines);
  element.dataset.revealState = 'split';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.dataset.revealState = 'visible';
    });
  });
  window.setTimeout(
    () => {
      element.textContent = text;
      element.dataset.revealState = 'done';
    },
    lines.length * lineDelay + settleMilliseconds,
  );
  if (/^H[1-6]$/.test(element.tagName)) {
    refract(element, { strength: 10, duration: 1200 });
  }
}

export function revealOnScroll(scope: ParentNode): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        observer.unobserve(entry.target);
        reveal(entry.target as HTMLElement);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );

  const fold = window.innerHeight;
  for (const element of scope.querySelectorAll<HTMLElement>('[data-reveal]')) {
    if (element.children.length > 0 || element.getBoundingClientRect().top < fold) {
      continue;
    }
    element.dataset.revealState = 'pending';
    observer.observe(element);
  }
}
