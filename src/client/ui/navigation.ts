import type { ChapterTracker } from './ChapterTracker.ts';
import { refract } from './refraction.ts';

export function bindChapterLinks(scope: ParentNode, tracker: ChapterTracker): void {
  const links = [...scope.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]')];
  if (links.length === 0) {
    return;
  }
  let activeId: string | null = null;
  tracker.subscribe(({ id }) => {
    if (id === activeId) {
      return;
    }
    activeId = id;
    for (const link of links) {
      if (link.dataset.chapterLink === id) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  });
}

export function bindLanguageLinks(scope: ParentNode, tracker: ChapterTracker): void {
  const links = [
    ...scope.querySelectorAll<HTMLAnchorElement>('[data-language-link][data-chapter-anchors]'),
  ].map((link) => ({
    element: link,
    basePath: link.getAttribute('href') ?? '/',
    anchors: JSON.parse(link.dataset.chapterAnchors ?? '{}') as Record<string, string>,
  }));
  if (links.length === 0) {
    return;
  }
  let activeId: string | null = null;
  tracker.subscribe(({ id, index }) => {
    if (id === activeId) {
      return;
    }
    activeId = id;
    for (const { element, basePath, anchors } of links) {
      const anchor = id && index > 0 ? anchors[id] : undefined;
      element.setAttribute('href', anchor ? `${basePath}#${anchor}` : basePath);
    }
  });
}

export function bindSiteMenu(scope: Document): void {
  const menu = scope.getElementById('site-menu');
  if (!menu || typeof menu.hidePopover !== 'function') {
    return;
  }
  menu.addEventListener('toggle', (event) => {
    if ((event as ToggleEvent).newState !== 'open') {
      return;
    }
    menu.querySelectorAll<HTMLElement>('.site-menu__chapter').forEach((chapter, index) => {
      window.setTimeout(() => refract(chapter, { strength: 14, duration: 1000 }), 120 + index * 60);
    });
  });
  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      menu.hidePopover();
    }
  });
}
