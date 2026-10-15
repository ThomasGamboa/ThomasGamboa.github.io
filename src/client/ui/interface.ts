import { ChapterTracker } from './ChapterTracker.ts';
import { Cursor } from './Cursor.ts';
import { Hud } from './Hud.ts';
import { bindMedia } from './media.ts';
import { bindChapterLinks, bindLanguageLinks, bindSiteMenu } from './navigation.ts';
import { bindRefraction, refract } from './refraction.ts';
import { revealOnScroll } from './reveal.ts';
import { scramble } from './scramble.ts';

function whenStageReady(callback: () => void): void {
  const loader = document.querySelector<HTMLElement>('[data-loader]');
  if (!loader || loader.dataset.state === 'complete') {
    callback();
    return;
  }
  const observer = new MutationObserver(() => {
    if (loader.dataset.state === 'complete') {
      observer.disconnect();
      callback();
    }
  });
  observer.observe(loader, { attributes: true, attributeFilter: ['data-state'] });
}

function lightUpChapters(tracker: ChapterTracker): void {
  let activeId: string | null = null;
  tracker.subscribe(({ id }) => {
    if (!id || id === activeId) {
      return;
    }
    activeId = id;
    const title = document.querySelector<HTMLElement>(
      `[data-chapter="${id}"] :is(.chapter__title, .hero__title)`,
    );
    if (title) {
      refract(title, { strength: 12, duration: 1300 });
    }
  });
}

function scrambleActions(scope: Document): void {
  for (const link of scope.querySelectorAll<HTMLAnchorElement>('a.action')) {
    const text = link.textContent?.trim() ?? '';
    if (!text) {
      continue;
    }
    link.setAttribute('aria-label', text);
    link.addEventListener('pointerenter', () => scramble(link, text, 480));
    link.addEventListener('focus', () => {
      if (link.matches(':focus-visible')) {
        scramble(link, text, 480);
      }
    });
  }
}

export function startInterface(): ChapterTracker {
  const tracker = new ChapterTracker(document);
  const hud = document.querySelector<HTMLElement>('[data-hud]');
  if (hud) {
    new Hud(hud, tracker);
  }
  bindChapterLinks(document, tracker);
  bindLanguageLinks(document, tracker);
  bindSiteMenu(document);
  bindRefraction(document);
  scrambleActions(document);
  revealOnScroll(document);
  bindMedia(document);
  Cursor.mount(document.body);
  whenStageReady(() => {
    const headline = document.querySelector<HTMLElement>('h1');
    if (headline) {
      refract(headline, { strength: 16, duration: 1600 });
    }
    lightUpChapters(tracker);
  });
  return tracker;
}
