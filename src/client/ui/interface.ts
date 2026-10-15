import { ChapterTracker } from './ChapterTracker.ts';
import { Cursor } from './Cursor.ts';
import { Hud } from './Hud.ts';
import { bindMedia } from './media.ts';
import { bindChapterLinks, bindLanguageLinks, bindSiteMenu } from './navigation.ts';
import { revealOnScroll } from './reveal.ts';

export function startInterface(): ChapterTracker {
  const tracker = new ChapterTracker(document);
  const hud = document.querySelector<HTMLElement>('[data-hud]');
  if (hud) {
    new Hud(hud, tracker);
  }
  bindChapterLinks(document, tracker);
  bindLanguageLinks(document, tracker);
  bindSiteMenu(document);
  revealOnScroll(document);
  bindMedia(document);
  Cursor.mount(document.body);
  return tracker;
}
